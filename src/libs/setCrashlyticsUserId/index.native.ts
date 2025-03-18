import crashlytics from '@react-native-firebase/crashlytics';

const setCrashlyticsUserId = (accountID: string | number) => {
    crashlytics().setUserId(accountID.toString());
};

export default setCrashlyticsUserId;
