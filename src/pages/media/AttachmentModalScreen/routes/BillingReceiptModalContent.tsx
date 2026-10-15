import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenType} from '@pages/media/AttachmentModalScreen/types';

import ROUTES from '@src/ROUTES';

import React, {useCallback, useMemo} from 'react';

import useDownloadAttachment from './hooks/useDownloadAttachment';

type BillingReceiptModalContentProps = {
    purchaseID: string;
    source: string;
    navigation: PlatformStackNavigationProp<RootNavigatorParamList, AttachmentModalScreenType>;
};

function BillingReceiptModalContent({purchaseID, source, navigation}: BillingReceiptModalContentProps) {
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
