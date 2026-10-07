import * as Sentry from '@sentry/react-native';

const testCrash = () => {
    // Tags sync to the native scope, fingerprints don't. Lets Sentry filter or fingerprint these QA crashes apart.
    Sentry.setTag('test_crash', 'true');
    Sentry.nativeCrash();
};
export default testCrash;
