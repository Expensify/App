import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import {NativeModules} from 'react-native';
import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';

export default function setEnvironment() {
    if (lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
        Onyx.set(ONYXKEYS.ENVIRONMENT, CONST.ENVIRONMENT.DEV);
        return;
    }

    // Since we promote staging builds to production without creating a new build, check w/ the native side to see if
    // this is staging (TestFlight) or production
    NativeModules.EnvironmentChecker.isBeta()
        .then((isBeta) => {
            const env = isBeta ? CONST.ENVIRONMENT.STAGING : CONST.ENVIRONMENT.PRODUCTION;
            Onyx.set(ONYXKEYS.ENVIRONMENT, env);
        });
}
