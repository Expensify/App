import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOpenConciergeAnywhere from '@hooks/useOpenConciergeAnywhere';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import fileDownload from '@libs/fileDownload';
import {buildSecureDownloadURL} from '@libs/UrlUtils';

import {sendExportFileFromConcierge} from '@userActions/Export';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import ActivityIndicator from './ActivityIndicator';
import Button from './ButtonComposed';
import Modal from './Modal';
import RenderHTML from './RenderHTML';
import Text from './Text';

type ExportDownloadStatusModalProps = {
    /** The export ID to subscribe to */
    exportID: string;

    /** Whether the modal is visible */
    isVisible: boolean;

    /** Callback when the modal is closed */
    onClose: () => void;

    /** Body text for the failed state — PDF and CSV use different copy */
    failedBody?: string;
};

function ExportDownloadStatusModal({exportID, isVisible, onClose, failedBody}: ExportDownloadStatusModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // isSmallScreenWidth is needed here because the modal type depends on actual screen width, not layout mode
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {environment} = useEnvironment();

    const [encryptedAuthToken] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.encryptedAuthToken});

    const [exportDownload] = useOnyx(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
    const displayedExport = usePreviousDefined(exportDownload);

    const state = displayedExport?.state;
    const shouldSendFromConcierge = displayedExport?.shouldSendFromConcierge;
    const fileName = displayedExport?.fileName;
    const exportType = displayedExport?.exportType;
    const failedReportCount = displayedExport?.failedReportCount ?? 0;
    const reportCount = displayedExport?.reportCount ?? 0;
    const receiptCount = displayedExport?.receiptCount;
    const failedReceiptCount = displayedExport?.failedReceiptCount ?? 0;
    const isPreparing = state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING && !shouldSendFromConcierge;
    const isConcierge = !!shouldSendFromConcierge;
    const isReady = state === CONST.EXPORT_DOWNLOAD.STATE.READY;
    const isFailed = state === CONST.EXPORT_DOWNLOAD.STATE.FAILED;
    const isEmptyReceipts = isReady && exportType === CONST.EXPORT_DOWNLOAD.TYPE.RECEIPTS && receiptCount === 0;

    // Build the secure download URL the same way downloadReportPDF does, so the host always follows
    // the app's current environment (instead of the env baked into a backend-built URL) and authenticates
    // via the encryptedAuthToken — no separate OldDot sign-in needed.
    const downloadFile = () => {
        if (!fileName || !currentUserLogin) {
            return;
        }
        const baseURL = getOldDotURLFromEnvironment(environment);
        const isCSV = fileName.endsWith('.csv');
        const secureType = isCSV ? CONST.SECURE_DOWNLOAD_TYPE.CSV_EXPORT : CONST.SECURE_DOWNLOAD_TYPE.PDF_REPORT;
        const url = buildSecureDownloadURL({baseURL, secureType, fileName, downloadName: fileName, email: currentUserLogin});
        fileDownload(translate, addEncryptedAuthTokenToURL(url, encryptedAuthToken ?? '', true), fileName, '', isMobileSafari(), undefined, undefined, undefined, undefined, false);
    };

    useEffect(() => {
        if (!isReady || !fileName || shouldSendFromConcierge || isEmptyReceipts) {
            return;
        }
        downloadFile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, fileName, shouldSendFromConcierge, isEmptyReceipts]);

    const handleSendFromConcierge = () => {
        sendExportFileFromConcierge(exportID, displayedExport ?? undefined);
    };
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();

    const handleGoToConcierge = () => {
        onClose();
        openConciergeAnywhere({forceConcierge: true});
    };

    const handleDownloadFile = () => {
        downloadFile();
        // Clearing the export download is owned by the parent's onClose handler (it runs on every dismissal and
        // skips the clear for the Concierge path). Clearing here too would queue a duplicate ClearExportDownload write.
        onClose();
    };

    const isNonDismissible = isPreparing;
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: isSmallScreenWidth, addOfflineIndicatorBottomSafeAreaPadding: false, style: styles.m5});

    const renderContent = () => {
        if (isPreparing) {
            return (
                <>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb2]}>
                        <Text style={[styles.exportDownloadTitle, styles.flexShrink1]}>{translate('exportDownload.preparingTitle')}</Text>
                        <ActivityIndicator size="small" />
                    </View>
                    <Text style={styles.mb5}>{translate('exportDownload.preparingBody')}</Text>
                    <Button
                        onPress={handleSendFromConcierge}
                        style={styles.w100}
                    >
                        <Button.Text>{translate('exportDownload.sendFromConcierge')}</Button.Text>
                    </Button>
                </>
            );
        }

        if (isConcierge) {
            return (
                <>
                    <Text style={[styles.exportDownloadTitle, styles.mb2]}>{translate('exportDownload.conciergeTitle')}</Text>
                    <Text style={styles.mb5}>{translate('exportDownload.conciergeBody')}</Text>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={handleGoToConcierge}
                        style={styles.w100}
                    >
                        <Button.Text>{translate('exportDownload.goToConcierge')}</Button.Text>
                    </Button>
                    <Button
                        onPress={onClose}
                        style={[styles.w100, styles.mt3]}
                    >
                        <Button.Text>{translate('exportDownload.dismiss')}</Button.Text>
                    </Button>
                </>
            );
        }

        if (isEmptyReceipts) {
            return (
                <>
                    <Text style={[styles.exportDownloadTitle, styles.mb2]}>{translate('exportDownload.noReceiptsTitle')}</Text>
                    <Text style={styles.mb5}>{translate('exportDownload.noReceiptsBody')}</Text>
                    <Button
                        onPress={onClose}
                        style={styles.w100}
                    >
                        <Button.Text>{translate('exportDownload.close')}</Button.Text>
                    </Button>
                </>
            );
        }

        if (isReady) {
            const renderPartialBody = () => {
                if (exportType === CONST.EXPORT_DOWNLOAD.TYPE.RECEIPTS && failedReceiptCount > 0) {
                    return (
                        <Text style={styles.mb5}>
                            {translate('exportDownload.receiptsPartialBody', {
                                count: (receiptCount ?? 0) - failedReceiptCount,
                                total: receiptCount ?? 0,
                            })}
                        </Text>
                    );
                }
                if (failedReportCount > 0) {
                    return (
                        <View style={styles.mb5}>
                            <RenderHTML
                                html={translate('exportDownload.readyPartialBody', {
                                    count: reportCount,
                                    total: reportCount + failedReportCount,
                                })}
                            />
                        </View>
                    );
                }
                return <Text style={styles.mb5}>{translate('exportDownload.readyBody')}</Text>;
            };

            return (
                <>
                    <Text style={[styles.exportDownloadTitle, styles.mb2]}>{translate('exportDownload.readyTitle')}</Text>
                    {renderPartialBody()}
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={handleDownloadFile}
                        style={styles.w100}
                    >
                        <Button.Text>{translate('exportDownload.downloadFile')}</Button.Text>
                    </Button>
                </>
            );
        }

        if (isFailed) {
            const getDefaultFailedBody = () => {
                if (exportType === CONST.EXPORT_DOWNLOAD.TYPE.CSV) {
                    return translate('exportDownload.csvFailedBody');
                }
                if (exportType === CONST.EXPORT_DOWNLOAD.TYPE.RECEIPTS) {
                    return translate('exportDownload.receiptsFailedBody');
                }
                return translate('exportDownload.pdfFailedBody');
            };
            const resolvedFailedBody = failedBody ?? getDefaultFailedBody();
            return (
                <>
                    <Text style={[styles.exportDownloadTitle, styles.mb2]}>{translate('exportDownload.failedTitle')}</Text>
                    {!!resolvedFailedBody && <Text style={styles.mb5}>{resolvedFailedBody}</Text>}
                    <Button
                        onPress={onClose}
                        style={styles.w100}
                    >
                        <Button.Text>{translate('exportDownload.close')}</Button.Text>
                    </Button>
                </>
            );
        }

        return null;
    };

    return (
        <Modal
            isVisible={isVisible}
            onClose={isNonDismissible ? () => {} : onClose}
            onBackdropPress={isNonDismissible ? () => {} : undefined}
            shouldTreatModalAsCovering
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={bottomSafeAreaPaddingStyle}>{renderContent()}</View>
        </Modal>
    );
}

ExportDownloadStatusModal.displayName = 'ExportDownloadStatusModal';

export default ExportDownloadStatusModal;
