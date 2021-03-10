import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import HeaderGap from '../../components/HeaderGap';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

const PasswordPage = () => (
    <>
        <HeaderGap />
        <HeaderWithCloseButton
            title="Change Password"
            shouldShowBackButton
            onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal()}
        />
    </>
);

PasswordPage.displayName = 'PasswordPage';

export default PasswordPage;
