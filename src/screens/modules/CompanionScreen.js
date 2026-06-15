import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { askAurora } from '../../services/aiService';
import { speak, stopSpeaking } from '../../services/voiceService';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

function BreathingOrb({ isRecording, isTranscribing, loading, isSpeaking }) {
  const breathe = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const innerRotate = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.4)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const speed = isRecording ? 300 : loading ? 500 : isSpeaking ? 400 : 2000;
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.2, duration: speed, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0.95, duration: speed, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 6000, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.timing(innerRotate, { toValue: -1, duration: 4000, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.8, duration: speed * 1.2, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.3, duration: speed * 1.2, useNativeDriver: true }),
      ])
    ).start();

    if (isRecording || isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring1Scale, { toValue: 2, duration: 1200, useNativeDriver: true }),
          Animated.timing(ring1Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(ring2Scale, { toValue: 2, duration: 1200, useNativeDriver: true }),
          Animated.timing(ring2Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isRecording, loading, isSpeaking]);

  const orbColors = isRecording
    ? [colors.error, '#FF6B6B']
    : loading || isTranscribing
    ? [colors.accent, colors.warning]
    : isSpeaking
    ? [colors.secondary, colors.habits]
    : [colors.companion, colors.primary];

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinBack = innerRotate.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] });

  return (
    <View style={orbStyles.container}>
      <Animated.View style={[orbStyles.glow, { opacity: glow, backgroundColor: orbColors[0] }]} />

      {(isRecording || isSpeaking) && (
        <>
          <Animated.View style={[orbStyles.ripple, { transform: [{ scale: ring1Scale }], borderColor: orbColors[0] + '40' }]} />
          <Animated.View style={[orbStyles.ripple, { transform: [{ scale: ring2Scale }], borderColor: orbColors[0] + '25' }]} />
        </>
      )}

      <Animated.View style={[orbStyles.outerRing, { transform: [{ rotate: spin }], borderColor: orbColors[0] + '50' }]} />
      <Animated.View style={[orbStyles.innerRing, { transform: [{ rotate: spinBack }], borderColor: orbColors[1] + '60' }]} />

      <Animated.View style={[orbStyles.core, { transform: [{ scale: breathe }] }]}>
        <LinearGradient colors={orbColors} style={orbStyles.coreGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={orbStyles.shine} />
          <Text style={orbStyles.letter}>A</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const orbStyles = StyleSheet.create({
  container: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 70, height: 70, borderRadius: 35, opacity: 0.3 },
  ripple: { position: 'absolute', width: 54, height: 54, borderRadius: 27, borderWidth: 1.5 },
  outerRing: { position: 'absolute', width: 58, height: 58, borderRadius: 29, borderWidth: 1.5 },
  innerRing: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 1 },
  core: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', elevation: 8 },
  coreGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shine: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.35)', top: 6, left: 8 },
  letter: { color: '#fff', fontSize: 20, fontWeight: '800' },
});

export default function CompanionScreen() {
  const { user } = useAuth();
  const { todayData, habits, streaks, addWater, logSleep, completeHabit } = useHealth();

  const [messages, setMessages] = useState([
    {
      role: 'aurora',
      text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm Aurora, your personal health companion. Tap the mic to speak, or type below!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingObj, setRecordingObj] = useState(null);

  const scrollRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const micAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading || isTranscribing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading, isTranscribing]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micAnim, { toValue: 1.4, duration: 400, useNativeDriver: true }),
          Animated.timing(micAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      micAnim.setValue(1);
    }
  }, [isRecording]);

  const handleSend = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const result = await askAurora(userText, user, todayData, habits, streaks);
    setLoading(false);
    setMessages(prev => [...prev, { role: 'aurora', text: result.message }]);

    stopSpeaking();
    setIsSpeaking(true);
    speak(result.message, {
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });

    if (result.action) await executeAction(result.action);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const executeAction = async (action) => {
    try {
      if (action.action === 'log_water' && action.amount) await addWater(action.amount);
      else if (action.action === 'log_sleep' && action.hours) await logSleep(action.hours, null, null);
      else if (action.action === 'complete_habit' && action.habitName) {
        const habit = habits.find(h => h.name.toLowerCase().includes(action.habitName.toLowerCase()));
        if (habit) await completeHabit(habit.id);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) { console.log('Action error:', e); }
  };

  const handleMicPress = async () => {
    if (isRecording) {
      // Stop recording
      try {
        setIsRecording(false);
        setIsTranscribing(true);
        await recordingObj.stopAndUnloadAsync();
        const uri = recordingObj.getURI();
        setRecordingObj(null);
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

        if (uri) {
          // Send to Groq Whisper
          const formData = new FormData();
          formData.append('file', { uri, type: 'audio/m4a', name: 'voice.m4a' });
          formData.append('model', 'whisper-large-v3');
          formData.append('language', 'en');

          const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer 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` },
            body: formData,
          });
          const data = await res.json();
          const text = data.text || '';
          setIsTranscribing(false);
          if (text.trim()) {
            handleSend(text.trim());
          } else {
            setMessages(prev => [...prev, { role: 'aurora', text: "I couldn't hear that clearly. Please try again!" }]);
          }
        } else {
          setIsTranscribing(false);
        }
      } catch (e) {
        console.log('Stop recording error:', e);
        setIsTranscribing(false);
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          setMessages(prev => [...prev, {
            role: 'aurora',
            text: "I need microphone permission! Please go to Settings → Apps → Aurora → Permissions → Allow Microphone.",
          }]);
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecordingObj(recording);
        setIsRecording(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        stopSpeaking();
        setIsSpeaking(false);
      } catch (e) {
        console.log('Start recording error:', e);
        setMessages(prev => [...prev, {
          role: 'aurora',
          text: "Couldn't start recording. Please check microphone permissions in Settings.",
        }]);
      }
    }
  };

  const getStatus = () => {
    if (isRecording) return { text: 'recording... tap to stop', color: colors.error };
    if (isTranscribing) return { text: 'processing voice...', color: colors.accent };
    if (loading) return { text: 'thinking...', color: colors.accent };
    if (isSpeaking) return { text: 'speaking...', color: colors.secondary };
    return { text: 'online', color: colors.success };
  };

  const status = getStatus();

  const QUICK_PROMPTS = [
    'How am I doing? 📊',
    'I drank 500ml water 💧',
    'I slept 7 hours 🌙',
    'What to focus on? 🎯',
    'Complete meditation 🧘',
    'Tips for sleep 😴',
  ];

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#0A0A1A', '#1a0533', '#0d1f3c']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BreathingOrb
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            loading={loading}
            isSpeaking={isSpeaking}
          />
          <View>
            <Text style={styles.headerTitle}>Aurora</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.headerSub, { color: status.color }]}>{status.text}</Text>
            </View>
          </View>
        </View>
        {isSpeaking && (
          <TouchableOpacity style={styles.stopBtn} onPress={() => { stopSpeaking(); setIsSpeaking(false); }}>
            <Ionicons name="volume-mute" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, i) => (
          <View key={i} style={[styles.bubbleRow, msg.role === 'user' ? styles.userRow : styles.auroraRow]}>
            {msg.role === 'aurora' && (
              <LinearGradient colors={[colors.companion, colors.primary]} style={styles.avatar}>
                <Text style={styles.avatarText}>A</Text>
              </LinearGradient>
            )}
            <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.auroraBubble]}>
              <Text style={[styles.bubbleText, msg.role === 'user' ? styles.userText : styles.auroraText]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}

        {(loading || isTranscribing) && (
          <View style={[styles.bubbleRow, styles.auroraRow]}>
            <LinearGradient colors={[colors.companion, colors.primary]} style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </LinearGradient>
            <View style={styles.auroraBubble}>
              <View style={styles.typingDots}>
                {[0, 1, 2].map(i => (
                  <Animated.View key={i} style={[styles.typingDot, {
                    opacity: pulseAnim.interpolate({ inputRange: [1, 1.2], outputRange: [0.3, 1] })
                  }]} />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Recording bar */}
      {isRecording && (
        <View style={styles.recordingBar}>
          <Animated.View style={[styles.recordingDot, { transform: [{ scale: micAnim }] }]} />
          <Text style={styles.recordingText}>🎙️ Recording... tap mic again to send</Text>
        </View>
      )}

      {/* Quick prompts */}
      {!isRecording && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRow}
          contentContainerStyle={styles.quickContent}
          keyboardShouldPersistTaps="handled"
        >
          {QUICK_PROMPTS.map(p => (
            <TouchableOpacity
              key={p}
              style={styles.quickChip}
              onPress={() => handleSend(p.replace(/[📊💧🌙🎯🧘😴]/g, '').trim())}
            >
              <Text style={styles.quickChipText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask Aurora anything..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          editable={!isRecording && !isTranscribing}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={() => handleSend()}
        />
        <Animated.View style={{ transform: [{ scale: isRecording ? micAnim : new Animated.Value(1) }] }}>
          <TouchableOpacity onPress={handleMicPress} activeOpacity={0.8}>
            <LinearGradient
              colors={isRecording ? [colors.error, '#FF6B6B'] : [colors.surface, colors.backgroundElevated]}
              style={styles.micBtn}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic-outline'}
                size={20}
                color={isRecording ? colors.white : colors.textSecondary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={input.trim() ? [colors.primary, colors.primaryDark] : [colors.surface, colors.surface]}
            style={styles.sendBtn}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={input.trim() ? colors.white : colors.textMuted}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, paddingTop: 60,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, color: colors.textPrimary, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  headerSub: { fontSize: 12 },
  stopBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 20, padding: 8,
    borderWidth: 1, borderColor: colors.error + '40',
  },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 14, paddingBottom: 16 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userRow: { justifyContent: 'flex-end' },
  auroraRow: { justifyContent: 'flex-start' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  bubble: { maxWidth: width * 0.72, borderRadius: 20, padding: 14 },
  userBubble: {
    backgroundColor: colors.primary, borderBottomRightRadius: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  auroraBubble: {
    backgroundColor: colors.backgroundCard, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: colors.white },
  auroraText: { color: colors.textPrimary },
  typingDots: { flexDirection: 'row', gap: 5, padding: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textSecondary },
  recordingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 12, marginBottom: 8, padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1, borderColor: colors.error + '30',
  },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  recordingText: { color: colors.error, fontSize: 13 },
  quickRow: {
    maxHeight: 50,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  quickContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  quickChip: {
    backgroundColor: colors.surface, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  quickChipText: { color: colors.textSecondary, fontSize: 13 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 100,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0A0A1A',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});