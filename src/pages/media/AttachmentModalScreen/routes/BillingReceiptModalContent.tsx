import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useCallback, useMemo} from 'react';

import useDownloadAttachment from './hooks/useDownloadAttachment';

function BillingReceiptModalContent({navigation, route}: AttachmentModalScreenProps<typeof SCREENS.BILLING_RECEIPT>) {
    const {purchaseID, source} = route.params;
    const {translate} = useLocalize();

    const isAuthTokenRequired = typeof source === 'string' && source.includes('expensify.com');
    const onDownloadAttachment = useDownloadAttachment({isAuthTokenRequired});

    const handleClose = useCallback(() => {
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_PAYMENT_DETAILS.getRoute(purchaseID));
    }, [purchaseID]);

    const contentProps = useMemo<AttachmentModalBaseContentProps>(
        () => ({
            source,
            headerTitle: translate('common.receipt'),
            isAuthTokenRequired,
            shouldShowNotFoundPage: !source,
            onDownloadAttachment,
            shouldAllowDownloadOutsideReportContext: true,
            shouldCloseOnSwipeDown: true,
        }),
        [source, translate, isAuthTokenRequired, onDownloadAttachment],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
            onClose={handleClose}
        />
    );
}

export default BillingReceiptModalContent;
