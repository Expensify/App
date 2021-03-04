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
            onCloseButtonPress={() => redirect(ROUTES.SETTINGS)}
        />
    </>
);

PasswordPage.displayName = 'PasswordPage';

export default PasswordPage;
