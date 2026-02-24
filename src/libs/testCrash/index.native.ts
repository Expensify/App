import * as Sentry from '@sentry/react-native';

const testCrash = () => {
    Sentry.nativeCrash();
};
export default testCrash;
