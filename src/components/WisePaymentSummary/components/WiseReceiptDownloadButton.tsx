/**
 * Downloads the receipt of a report's Wise transfer. It shows only once Wise provides the receipt, which happens after the payment leaves Wise.
 */
import LinkButton from '@components/Button/composed/LinkButton';
import {isLatestWiseReceiptAvailable} from '@components/WisePaymentSummary/utils/getPaidWisePaymentAmounts';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {showGeneralErrorAlert} from '@libs/fileDownload/FileUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {downloadWiseTransferReceipt} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

type WiseReceiptDownloadButtonProps = {
    reportID: string;
};

function WiseReceiptDownloadButton({reportID}: WiseReceiptDownloadButtonProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['Download']);
    const [isReceiptAvailable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {selector: isLatestWiseReceiptAvailable});
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadReceipt = () => {
        if (isDownloading) {
            return;
        }
        setIsDownloading(true);
        // Without its own failure callback, the web download would open the command URL in a new tab
        downloadWiseTransferReceipt(reportID, translate, () => showGeneralErrorAlert(translate)).finally(() => setIsDownloading(false));
    };

    // The server has to fetch the receipt from Wise, so there is nothing to download offline. A download already running stays visible until it ends.
    if (!isReceiptAvailable || (isOffline && !isDownloading)) {
        return null;
    }

    return (
        <LinkButton
            onPress={downloadReceipt}
            isLoading={isDownloading}
            size={CONST.BUTTON_SIZE.SMALL}
            sentryLabel={CONST.SENTRY_LABEL.WISE_PAYMENT_DETAILS.DOWNLOAD_RECEIPT}
        >
            <LinkButton.Icon src={icons.Download} />
            <LinkButton.Text>{translate('iou.wisePaymentSummary.downloadReceipt')}</LinkButton.Text>
        </LinkButton>
    );
}

export default WiseReceiptDownloadButton;
