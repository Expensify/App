import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import HeaderGap from '../../components/HeaderGap';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

const PaymentsPage = () => (
    <>
        <HeaderGap />
        <HeaderWithCloseButton
            title="Payments"
            shouldShowBackButton
            onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal()}
        />
    </>
);

PaymentsPage.displayName = 'PaymentsPage';

export default PaymentsPage;
