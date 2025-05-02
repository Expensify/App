import crashlytics from '@react-native-firebase/crashlytics';

const testCrash = () => {
    crashlytics().crash();
};
export default testCrash;
