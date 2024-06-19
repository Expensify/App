import crashlytics from '@react-native-firebase/crashlytics';
import type UseCrashlyticsProps from './types';

const setCrashlyticsUserId = ({isAuthenticated, accountID}: UseCrashlyticsProps) => {
    if (!isAuthenticated) {
        return;
    }
    crashlytics().setUserId(Number(accountID).toString());
};

export default setCrashlyticsUserId;
