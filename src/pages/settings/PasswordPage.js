import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ScreenWrapper from '../../components/ScreenWrapper';

const PasswordPage = () => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title="Change Password"
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal()}
        />
    </ScreenWrapper>
);

PasswordPage.displayName = 'PasswordPage';

export default PasswordPage;
