import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

let recordingInstance = null;

export const speak = (text, options = {}) => {
  Speech.stop();
  Speech.speak(text, {
    language: 'en-US',
    pitch: 1.05,
    rate: 0.90,
    onDone: options.onDone || (() => {}),
    onError: options.onError || (() => {}),
  });
};

export const stopSpeaking = () => Speech.stop();

export const isSpeakingAsync = () => Speech.isSpeakingAsync();

export const requestMicPermission = async () => {
  const { granted } = await Audio.requestPermissionsAsync();
  return granted;
};

export const startRecording = async () => {
  try {
    const granted = await requestMicPermission();
    if (!granted) return null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recordingInstance = recording;
    return recording;
  } catch (e) {
    console.log('Recording error:', e);
    return null;
  }
};

export const stopRecording = async () => {
  try {
    if (!recordingInstance) return null;
    await recordingInstance.stopAndUnloadAsync();
    const uri = recordingInstance.getURI();
    recordingInstance = null;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    return uri;
  } catch (e) {
    console.log('Stop recording error:', e);
    return null;
  }
};

export const transcribeAudio = async (uri) => {
  try {
    const GROQ_API_KEY = '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';

    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    });
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'en');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Transcription failed');
    const data = await response.json();
    return data.text || '';
  } catch (e) {
    console.log('Transcription error:', e);
    return '';
  }
};