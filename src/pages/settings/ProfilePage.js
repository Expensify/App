import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import HeaderGap from '../../components/HeaderGap';
import ROUTES from '../../ROUTES';

const ProfilePage = () => (
    <>
        <HeaderGap />
        <HeaderWithCloseButton
            title="Profile"
            shouldShowBackButton
            onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
            onCloseButtonPress={() => redirect(ROUTES.HOME)}
        />
    </>
);

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
