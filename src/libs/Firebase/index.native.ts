/* eslint-disable no-unused-vars */
import {log as crashlyticsLog, getCrashlytics} from '@react-native-firebase/crashlytics';
import type {Log} from './types';

const crashlytics = getCrashlytics();

const log: Log = (action: string) => {
    crashlyticsLog(crashlytics, action);
};

export default {
    log,
};
