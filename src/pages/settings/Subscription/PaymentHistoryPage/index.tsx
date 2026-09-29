import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {openPaymentHistoryPage} from '@userActions/Subscription';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Purchase} from '@src/types/onyx/PurchaseList';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';

import PaymentHistoryTable from './PaymentHistoryTable';

// Copies of the returned purchases, shifted a year apart, so the table can be scrolled while the backend only sends a short history.
const TEMP_MOCK_PAYMENT_COUNT = 7;

function withTemporaryMockPurchases(purchaseList: Purchase[] | null | undefined): Purchase[] | null | undefined {
    if (!purchaseList?.length) {
        return purchaseList;
    }

    const maxPurchaseID = Math.max(...purchaseList.map((purchase) => purchase.purchaseID));
    const mocks: Purchase[] = [];
    for (let index = 0; index < TEMP_MOCK_PAYMENT_COUNT; index++) {
        const source = purchaseList.at(index % purchaseList.length);
        if (!source) {
            continue;
        }

        mocks.push({
            purchaseID: maxPurchaseID + index + 1,
            created: source.created.replace(/^(\d{4})/, (year) => String(Number(year) - (index + 1))),
            amount: source.amount,
            currency: source.currency,
            message: {
                ...source.message,
                refundPurchaseID: undefined,
                disputePurchaseID: undefined,
                fromPurchaseID: undefined,
                takenOverFrom: undefined,
                transferTo: undefined,
            },
        });
    }

    return [...purchaseList, ...mocks];
}

function PaymentHistoryPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const [purchaseList] = useOnyx(ONYXKEYS.PURCHASE_LIST);

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
                    <Text style={[styles.textNormal, styles.textSupporting, styles.mh5, styles.mb5, styles.userSelectText]}>{translate('subscription.paymentHistory.subtitle')}</Text>
                    <PaymentHistoryTable purchaseList={withTemporaryMockPurchases(purchaseList)} />
                </ScrollView>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

PaymentHistoryPage.displayName = 'PaymentHistoryPage';

export default PaymentHistoryPage;
