import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import ScreenWrapper from '../../components/ScreenWrapper';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

const ProfilePage = () => (
    <ScreenWrapper>
        {() => (
            <>
                <HeaderWithCloseButton
                    title="Profile"
                    shouldShowBackButton
                    onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
            </>
        )}
    </ScreenWrapper>
);

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
