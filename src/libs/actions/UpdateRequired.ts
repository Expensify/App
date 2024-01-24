import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Config from 'react-native-config';
import type Environment from '@libs/Environment/getEnvironment/types';

function alertUser() {
    // For now, we will pretty much never have to do this on a platform other than production.
    // We should only update the minimum app version in the API after all platforms of a new version have been deployed to PRODUCTION.
    // As staging is always ahead of production there is no reason to "force update" those apps.
    if (((Config?.ENVIRONMENT as Environment) ?? CONST.ENVIRONMENT.DEV) !== CONST.ENVIRONMENT.PRODUCTION) {
        return;
    }

    Onyx.set(ONYXKEYS.UPDATE_REQUIRED, true);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    alertUser,
};
