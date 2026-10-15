import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import type {PlatformStackNavigationProp, PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import {getReceiptSource} from '@libs/PaymentHistoryUtils';

import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';

import useDownloadAttachment from './hooks/useDownloadAttachment';

function BillingReceiptModalContent() {
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<RootNavigatorParamList, typeof SCREENS.BILLING_RECEIPT>>();
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList, typeof SCREENS.BILLING_RECEIPT>>();
    const [purchases] = useOnyx(ONYXKEYS.PURCHASES);

    const {purchaseID} = route.params;
    const source = getReceiptSource(purchases, Number(purchaseID)) ?? '';
    const onDownloadAttachment = useDownloadAttachment({isAuthTokenRequired: true});

    const contentProps: AttachmentModalBaseContentProps = {
        source,
        headerTitle: translate('common.receipt'),
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
