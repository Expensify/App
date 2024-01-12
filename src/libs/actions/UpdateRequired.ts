import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import getEnvironment from '@libs/Environment/getEnvironment';
import CONST from '@src/CONST';

function alertUser() {
    // For now, we will pretty much never have to do this on a platform other than production.
    // We should only update the minimum app version in the API after all platforms of a new version have been deployed to PRODUCTION.
    // As staging is always ahead of production there is no reason to "force update" those apps.
    getEnvironment().then((environment) => {
        if (environment !== CONST.ENVIRONMENT.PRODUCTION) {
            return;
        }

        Onyx.set(ONYXKEYS.UPDATE_REQUIRED, true);
    });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    alertUser
};
