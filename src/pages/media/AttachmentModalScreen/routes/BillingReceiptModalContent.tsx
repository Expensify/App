import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import type {PlatformStackNavigationProp, PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import {getReceiptFileName, getReceiptSource, isInvoiceBilling} from '@libs/PaymentHistoryUtils';

import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';

import {openPaymentDetailsPage} from '@userActions/Subscription';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';

import useDownloadAttachment from './hooks/useDownloadAttachment';

function BillingReceiptModalContent() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const route = useRoute<PlatformStackRouteProp<RootNavigatorParamList, typeof SCREENS.BILLING_RECEIPT>>();
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList, typeof SCREENS.BILLING_RECEIPT>>();
    const [purchases] = useOnyx(ONYXKEYS.PURCHASES);

    const {purchaseID} = route.params;
    const numericPurchaseID = Number(purchaseID);
    const purchase = purchases?.[purchaseID];

    useEffect(() => {
        if (purchase?.isLoaded || isOffline) {
            return;
        }
        openPaymentDetailsPage(numericPurchaseID);
    }, [purchase?.isLoaded, isOffline, numericPurchaseID]);

    const source = getReceiptSource(purchases, numericPurchaseID) ?? '';
    const onDownloadAttachment = useDownloadAttachment({isAuthTokenRequired: true});

    if (!purchase?.isLoaded) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    const originalFileName = getReceiptFileName(source, numericPurchaseID);
    const isInvoice = isInvoiceBilling(purchases, numericPurchaseID);

    const contentProps: AttachmentModalBaseContentProps = {
        source,
        originalFileName,
        headerTitle: translate(isInvoice ? 'common.invoice' : 'common.receipt'),
        isAuthTokenRequired: true,
        shouldShowNotFoundPage: !source,
        onDownloadAttachment,
        shouldAllowDownloadOutsideReportContext: true,
        shouldCloseOnSwipeDown: true,
    };

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
        />
    );
}

export default BillingReceiptModalContent;
