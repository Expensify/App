import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import {NativeModules} from 'react-native';
import CONST from '../../CONST';

export default function getEnvironment() {
    if (lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
        return CONST.ENVIRONMENT.DEV;
    }

    // Since we promote staging builds to production without creating a new build, check w/ the native side to see if
    // this is staging (TestFlight) or production
    return NativeModules.EnvironmentChecker.isBeta()
        ? CONST.ENVIRONMENT.STAGING
        : CONST.ENVIRONMENT.PRODUCTION;
}
