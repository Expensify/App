import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import {openPaymentHistoryPage} from '@userActions/Subscription';

import CONST from '@src/CONST';

import React, {useEffect} from 'react';

import PaymentHistoryTable from './PaymentHistoryTable';

function PaymentHistoryPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (isOffline) {
            return;
        }
        openPaymentHistoryPage();
    }, [isOffline]);

    return (
        <ScreenWrapper
            testID={PaymentHistoryPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButtonAndTitle title={translate('subscription.paymentHistory.title')} />
                <ScrollView>
                    <Text style={[styles.textNormal, styles.textSupporting, styles.mh5, styles.mb5, styles.userSelectText]}>{translate('subscription.paymentHistory.subtitle')}</Text>
                    <PaymentHistoryTable />
                </ScrollView>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

PaymentHistoryPage.displayName = 'PaymentHistoryPage';

export default PaymentHistoryPage;
