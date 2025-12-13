import {Platform} from 'react-native';
import handleStopRecordingAndroid from './handleStopRecording.android';
import handleStopRecordingIOS from './handleStopRecording.ios';
import handleStopRecordingNative from './handleStopRecording.native';
import type StopRecordingParams from './handleStopRecording.types';
import handleStopRecordingWeb from './handleStopRecording.web';

type HandleStopRecording = (params: StopRecordingParams) => Promise<void>;

const handleStopRecording: HandleStopRecording = (params) => {
    if (Platform.OS === 'ios') {
        return handleStopRecordingIOS(params);
    }

    if (Platform.OS === 'android') {
        return handleStopRecordingAndroid(params);
    }

    if (Platform.OS === 'web') {
        return handleStopRecordingWeb(params);
    }

    return handleStopRecordingNative(params);
};

export default handleStopRecording;
