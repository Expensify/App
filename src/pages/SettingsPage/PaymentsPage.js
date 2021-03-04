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
            onCloseButtonPress={() => redirect(ROUTES.SETTINGS)}
        />
    </>
);

PaymentsPage.displayName = 'PaymentsPage';

export default PaymentsPage;
