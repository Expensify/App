import {NativeModules} from 'react-native';
import type {EnvironmentCheckerProps, IsBetaBuild} from './types';

/**
 * Check to see if the build is staging (TestFlight) or production
 */
function isBetaBuild(): IsBetaBuild {
    return new Promise((resolve) => {
        const {EnvironmentChecker} = NativeModules;
        (EnvironmentChecker as EnvironmentCheckerProps).isBeta().then((isBeta: boolean) => {
            resolve(isBeta);
        });
    });
}

export default {
    isBetaBuild,
};
