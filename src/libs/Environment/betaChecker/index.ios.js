import {NativeModules} from 'react-native';

/**
 * Check to see if the build is staging (TestFlight) or production
 *
 * @returns {Promise}
 */
function isBetaBuild() {
    return new Promise((resolve) => {
        NativeModules.EnvironmentChecker.isBeta()
            .then((isBeta) => {
                resolve(isBeta);
            });
    });
}

export default {
    isBetaBuild,
};
