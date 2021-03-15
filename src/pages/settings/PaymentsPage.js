import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ScreenWrapper from '../../components/ScreenWrapper';

const PaymentsPage = () => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title="Payments"
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal()}
        />
    </ScreenWrapper>
);

PaymentsPage.displayName = 'PaymentsPage';

export default PaymentsPage;
