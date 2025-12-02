import {getCrashlytics, setUserId} from '@react-native-firebase/crashlytics';

const crashlytics = getCrashlytics();

const setCrashlyticsUserId = (accountID: string | number) => {
    setUserId(crashlytics, accountID.toString());
};

export default setCrashlyticsUserId;
