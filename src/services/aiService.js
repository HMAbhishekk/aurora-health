import { storage } from './storageService';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const buildSystemPrompt = (user, todayData, habits, streaks) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const doneHabits = habits.filter(h => h.completedDates?.includes(todayStr)).length;

  return `
You are Aurora, a warm, intelligent, and deeply personal AI health companion.
Your personality: encouraging, empathetic, insightful, concise. Like a best friend who happens to be a health coach.
Never sound robotic. Always sound human and caring.
Keep responses SHORT (2-3 sentences max) — they will be spoken aloud.

USER PROFILE:
- Name: ${user?.name || 'there'}
- Age: ${user?.age || 'not set'}
- Gender: ${user?.gender || 'not set'}
- Goals: ${user?.goals?.join(', ') || 'general health improvement'}
- Activity Level: ${user?.activity || 'not set'}

TODAY'S DATA (${todayStr}):
- Hydration: ${todayData?.hydration?.consumed || 0}ml of ${todayData?.hydration?.goal || 2500}ml goal
- Sleep last night: ${todayData?.sleep?.logged ? todayData.sleep.hours + ' hours' : 'not logged yet'}
- Habits completed: ${doneHabits} of ${habits.length} total habits
- Calories logged: ${todayData?.nutrition?.totals?.calories || 0} kcal
- Meals logged: ${todayData?.nutrition?.meals?.length || 0}

STREAKS:
- Hydration: ${streaks?.hydration || 0} days
- Sleep: ${streaks?.sleep || 0} days

HABITS LIST:
${habits.length > 0 ? habits.map(h => `- ${h.name} (${h.completedDates?.includes(todayStr) ? 'done today ✓' : 'pending'})`).join('\n') : 'No habits created yet'}

CRITICAL INSTRUCTION — ACTION DETECTION:
If the user says they did something (drank water, slept, completed a habit, ate a meal), you MUST respond with BOTH:
1. A friendly spoken message
2. A JSON action block on a NEW LINE

Action formats (use exactly):
{"action":"log_water","amount":500}
{"action":"log_sleep","hours":7.5}
{"action":"complete_habit","habitName":"meditation"}
{"action":"log_meal","type":"lunch","name":"salad","calories":350}

Example:
User: "I drank 2 glasses of water"
Response: Great job staying hydrated! I've added 500ml to your tracker.
{"action":"log_water","amount":500}

User: "I slept 8 hours last night"
Response: Amazing! 8 hours is perfect sleep. I've logged that for you.
{"action":"log_sleep","hours":8}

If no action needed, just respond conversationally. Never include JSON if the user is just asking a question.
`.trim();
};

export const askAurora = async (userMessage, user, todayData, habits, streaks) => {
  try {
    let recentMemories = '';
    try {
      const { getMemories } = require('./dbService');
      const memories = user?.id ? await getMemories(user.id) : [];
      recentMemories = memories.slice(0, 5).map(m => m.content).join('\n');
    } catch (e) {}

    const systemPrompt = buildSystemPrompt(user, todayData, habits, streaks) +
      (recentMemories ? `\n\nPAST OBSERVATIONS ABOUT THIS USER:\n${recentMemories}` : '');

    const response = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        temperature: 0.75,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData?.error?.message || 'Groq API error');
    }

    const data = await response.json();
    const fullText = data.choices[0].message.content.trim();

    // Parse action if present
    let action = null;
    let message = fullText;

    const actionMatch = fullText.match(/\{[^}]*"action"[^}]*\}/);
    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[0]);
        message = fullText.replace(actionMatch[0], '').trim();
      } catch (e) {
        // no valid action JSON
      }
    }

    // Save to Supabase memory
    if (message.length > 40 && user?.id) {
      try {
        const { saveMemory } = require('./dbService');
        await saveMemory(
          user.id,
          `[${new Date().toLocaleDateString()}] User: "${userMessage.slice(0, 80)}" → Aurora noted: "${message.slice(0, 100)}"`
        );
      } catch (e) {}
    }

    return { success: true, message, action };

  } catch (e) {
    console.log('Aurora AI error:', e.message);
    return {
      success: false,
      message: "I'm having a little trouble connecting right now. Please try again in a moment!",
      action: null,
    };
  }
};

export const generateDailyInsight = async (user, todayData, habits, streaks) => {
  try {
    const result = await askAurora(
      'Give me one short personalized health insight based on my data today. Be specific and motivating.',
      user, todayData, habits, streaks
    );
    return result.message;
  } catch (e) {
    return 'Stay consistent today — every small action builds your health! 💪';
  }
};