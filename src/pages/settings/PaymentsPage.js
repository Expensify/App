import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';

const PaymentsPage = () => (
    <ScreenWrapper>
        {() => (
            <>
                <HeaderWithCloseButton
                    title="Payments"
                    shouldShowBackButton
                    onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
            </>
        )}
    </ScreenWrapper>
);

PaymentsPage.displayName = 'PaymentsPage';

export default PaymentsPage;
