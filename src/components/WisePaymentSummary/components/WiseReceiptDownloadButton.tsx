/**
 * Downloads the receipt of a report's Wise transfer. It shows only once Wise provides the receipt, which happens after the payment leaves Wise.
 */
import Button from '@components/Button';
import {isLatestWiseReceiptAvailable} from '@components/WisePaymentSummary/utils/getPaidWisePaymentAmounts';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

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
    const theme = useTheme();
    const styles = useThemeStyles();
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
        <Button
            onPress={downloadReceipt}
            isLoading={isDownloading}
            size={CONST.BUTTON_SIZE.SMALL}
            innerStyles={styles.bgTransparent}
            hoverStyles={styles.hoveredComponentBG}
            sentryLabel={CONST.SENTRY_LABEL.WISE_PAYMENT_DETAILS.DOWNLOAD_RECEIPT}
        >
            <Button.Icon
                src={icons.Download}
                fill={theme.icon}
                hoverFill={theme.icon}
            />
            <Button.Text style={styles.textSupporting}>{translate('iou.wisePaymentSummary.downloadReceipt')}</Button.Text>
        </Button>
    );
}

export default WiseReceiptDownloadButton;
