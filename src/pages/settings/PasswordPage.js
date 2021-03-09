import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import HeaderGap from '../../components/HeaderGap';
import ROUTES from '../../ROUTES';

const PasswordPage = () => (
    <>
        <HeaderGap />
        <HeaderWithCloseButton
            title="Change Password"
            shouldShowBackButton
            onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
            onCloseButtonPress={() => redirect(ROUTES.HOME)}
        />
    </>
);

PasswordPage.displayName = 'PasswordPage';

export default PasswordPage;
