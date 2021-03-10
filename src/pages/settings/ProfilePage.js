import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import HeaderGap from '../../components/HeaderGap';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

const ProfilePage = () => (
    <>
        <HeaderGap />
        <HeaderWithCloseButton
            title="Profile"
            shouldShowBackButton
            onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal()}
        />
    </>
);

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
