import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

const testCrash = () => {
    // Tags sync to the native scope, fingerprints don't. Lets Sentry filter or fingerprint these QA crashes apart.
    Sentry.setTag(CONST.TELEMETRY.TAGS.TEST_CRASH, 'true');
    Sentry.nativeCrash();
};
export default testCrash;
