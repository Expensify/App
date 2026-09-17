import Navigation from '@libs/Navigation/Navigation';

import {clearSignInData, setAccountError} from '@userActions/Session';

import ROUTES from '@src/ROUTES';

function handleSAMLLoginError(errorMessage: string, shouldClearSignInData: boolean) {
    if (shouldClearSignInData) {
        clearSignInData();
    }

    setAccountError(errorMessage);
    Navigation.goBack(ROUTES.INBOX);
}

export default handleSAMLLoginError;
