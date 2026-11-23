/**
 * Downloads the receipt of a report's Wise transfer. It shows only once Wise provides the receipt, which happens after the payment leaves Wise.
 */
import LinkButton from '@components/Button/composed/LinkButton';
import {useSession} from '@components/OnyxListItemProvider';
import {isLatestWiseReceiptAvailable} from '@components/WisePaymentSummary/utils/getPaidWisePaymentAmounts';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import fileDownload from '@libs/fileDownload';
import {showGeneralErrorAlert} from '@libs/fileDownload/FileUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {buildSecureDownloadURL} from '@libs/UrlUtils';

import {getWiseTransferReceiptFileName} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

type WiseReceiptDownloadButtonProps = {
    reportID: string;
};

function WiseReceiptDownloadButton({reportID}: WiseReceiptDownloadButtonProps) {
    const {translate} = useLocalize();
    const {environment} = useEnvironment();
    const {isOffline} = useNetwork();
    const session = useSession();
    const icons = useMemoizedLazyExpensifyIcons(['Download']);
    const [isReceiptAvailable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {selector: isLatestWiseReceiptAvailable});
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadReceipt = () => {
        const currentUserLogin = session?.email;
        if (isDownloading || !currentUserLogin) {
            return;
        }
        setIsDownloading(true);
        getWiseTransferReceiptFileName(reportID)
            .then((fileName) => {
                if (!fileName) {
                    showGeneralErrorAlert(translate);
                    return;
                }
                const downloadFileName = `Wise_Receipt_${reportID}.pdf`;
                const pdfURL = buildSecureDownloadURL({
                    baseURL: getOldDotURLFromEnvironment(environment),
                    secureType: CONST.SECURE_DOWNLOAD_TYPE.PDF_REPORT,
                    fileName,
                    downloadName: downloadFileName,
                    email: currentUserLogin,
                });
                return fileDownload(translate, addEncryptedAuthTokenToURL(pdfURL, session?.encryptedAuthToken ?? '', true), downloadFileName, '', isMobileSafari());
            })
            .finally(() => setIsDownloading(false));
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
