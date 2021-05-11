import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import {NativeModules} from 'react-native';
import CONST from '../../CONST';

let environment = CONST.ENVIRONMENT.PRODUCTION;
let hasSetEnvironment = false;

function getEnvironment() {
    return new Promise((resolve) => {
        // If we've already set the environment, use the current value
        if (hasSetEnvironment) {
            return resolve(environment);
        }

        if (lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
            hasSetEnvironment = true;
            environment = CONST.ENVIRONMENT.DEV;
            return resolve(environment);
        }

        // Since we promote staging builds to production without creating a new build, check w/ the native side to see
        // if this is staging (TestFlight) or production
        NativeModules.EnvironmentChecker.isBeta()
            .then((isBeta) => {
                hasSetEnvironment = true;
                environment = isBeta ? CONST.ENVIRONMENT.STAGING : CONST.ENVIRONMENT.PRODUCTION;
                resolve(environment);
            });
    });
}

export default {
    getEnvironment,
};
