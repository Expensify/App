import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';

const PasswordPage = () => (
    <ScreenWrapper>
        {() => (
            <>
                <HeaderWithCloseButton
                    title="Change Password"
                    shouldShowBackButton
                    onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
            </>

        )}
    </ScreenWrapper>
);

PasswordPage.displayName = 'PasswordPage';

export default PasswordPage;
