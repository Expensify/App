import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import HeaderGap from '../../components/HeaderGap';
import ROUTES from '../../ROUTES';

const PaymentsPage = () => (
    <>
        <HeaderGap />
        <HeaderWithCloseButton
            title="Payments"
            shouldShowBackButton
            onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
            onCloseButtonPress={() => redirect(ROUTES.HOME)}
        />
    </>
);

PaymentsPage.displayName = 'PaymentsPage';

export default PaymentsPage;
