import {crash, getCrashlytics} from '@react-native-firebase/crashlytics';

const crashlytics = getCrashlytics();

const testCrash = () => {
    crash(crashlytics);
};
export default testCrash;
