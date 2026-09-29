import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {openPaymentHistoryPage} from '@userActions/Subscription';

import CONST from '@src/CONST';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';

function PaymentHistoryPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();

    useFocusEffect(
        useCallback(() => {
            if (!isBetaEnabled(CONST.BETAS.PAYMENT_HISTORY)) {
                return;
            }
            openPaymentHistoryPage();
        }, [isBetaEnabled]),
    );

    if (!isBetaEnabled(CONST.BETAS.PAYMENT_HISTORY)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID={PaymentHistoryPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('subscription.paymentHistory.title')}
                    onBackButtonPress={Navigation.goBack}
                />
                <ScrollView>
                    <Text style={[styles.textNormal, styles.textSupporting, styles.mh5, styles.mb5]}>{translate('subscription.paymentHistory.subtitle')}</Text>
                </ScrollView>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

PaymentHistoryPage.displayName = 'PaymentHistoryPage';

export default PaymentHistoryPage;
