import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import * as NetworkStore from '@libs/Network/NetworkStore';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import {openApp} from './App';
import updateSessionAuthTokens from './Session/updateSessionAuthTokens';

function connect(email: string) {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_AS_DELEGATE, {to: email}, {})
        .then((response) => {
            return SequentialQueue.waitForIdle()
                .then(() => Onyx.clear())
                .then(() => {
                    // Update authToken in Onyx and in our local variables so that API requests will use the new authToken
                    updateSessionAuthTokens(response?.restrictedToken, response?.encryptedAuthToken);

                    NetworkStore.setAuthToken(response?.restrictedToken ?? null);
                    openApp();
                });
        })
        .catch((error) => {
            console.error('Error during connect:', error);
        });
}

// eslint-disable-next-line import/prefer-default-export
export {connect};
