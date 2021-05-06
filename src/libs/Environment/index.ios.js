import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import {NativeModules} from 'react-native';
import CONST from '../../CONST';

let environment = CONST.ENVIRONMENT.PRODUCTION;

function getEnvironment() {
    return environment;
}

function setEnvironment() {
    if (lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
        environment = CONST.ENVIRONMENT.DEV;
        return;
    }

    // Since we promote staging builds to production without creating a new build, check w/ the native side to see if
    // this is staging (TestFlight) or production
    NativeModules.EnvironmentChecker.isBeta()
        .then((isBeta) => {
            environment = isBeta ? CONST.ENVIRONMENT.STAGING : CONST.ENVIRONMENT.PRODUCTION;
        });
}

export default {
    getEnvironment,
    setEnvironment,
};
