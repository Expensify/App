import Onyx from 'react-native-onyx';
import * as NetworkStore from '@libs/Network/NetworkStore';
import type Response from '@src/types/onyx/Response';
import {confirmReadyToOpenApp, openApp} from './App';
import {KEYS_TO_PRESERVE_DELEGATE_ACCESS} from './const';
import updateSessionAuthTokens from './Session/updateSessionAuthTokens';
import updateSessionUser from './Session/updateSessionUser';

// Moved from actions/Authentication.ts to avoid require cycles
function restoreDelegateSession(authenticateResponse: Response) {
    Onyx.clear(KEYS_TO_PRESERVE_DELEGATE_ACCESS).then(() => {
        updateSessionAuthTokens(authenticateResponse?.authToken, authenticateResponse?.encryptedAuthToken);
        updateSessionUser(authenticateResponse?.accountID, authenticateResponse?.email);

        NetworkStore.setAuthToken(authenticateResponse.authToken ?? null);
        NetworkStore.setIsAuthenticating(false);

        confirmReadyToOpenApp();
        openApp();
    });
}

export default restoreDelegateSession;
