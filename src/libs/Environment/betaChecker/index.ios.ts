import {NativeModules} from 'react-native';
import type {IsBetaBuild} from './types';

/**
 * Check to see if the build is staging (TestFlight) or production
 */
function isBetaBuild(): IsBetaBuild {
    return new Promise((resolve) => {
        NativeModules.EnvironmentChecker.isBeta().then((isBeta: boolean) => {
            resolve(isBeta);
        });
    });
}

export default {
    isBetaBuild,
};
