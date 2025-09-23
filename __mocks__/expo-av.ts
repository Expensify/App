import '@testing-library/react-native';
import { NativeModulesProxy } from 'expo-modules-core';

// Create a fake implementation of all ExponentAV methods
NativeModulesProxy.ExponentAV = {
    getStatusForVideo: jest.fn(),
    setAudioMode: jest.fn(),
    unloadAudioRecorder: jest.fn(),
    stopAudioRecording: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    setInput: jest.fn(),
    loadForVideo: jest.fn(),
    setAudioIsEnabled: jest.fn(),
    prepareAudioRecorder: jest.fn(),
    replayVideo: jest.fn(),
    getPermissionsAsync: jest.fn(),
    unloadForSound: jest.fn(),
    setStatusForSound: jest.fn(),
    unloadForVideo: jest.fn(),
    replaySound: jest.fn(),
    getAvailableInputs: jest.fn(),
    getAudioRecordingStatus: jest.fn(),
    setStatusForVideo: jest.fn(),
    loadForSound: jest.fn(),
    pauseAudioRecording: jest.fn(),
    getStatusForSound: jest.fn(),
    getCurrentInput: jest.fn(),
    startAudioRecording: jest.fn(),
};
