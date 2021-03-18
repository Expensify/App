import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import ROUTES from '../../ROUTES';

const ProfilePage = () => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title="Profile"
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal()}
        />
    </ScreenWrapper>
);

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
