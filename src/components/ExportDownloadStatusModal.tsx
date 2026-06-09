import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import fileDownload from '@libs/fileDownload';
import addTrailingForwardSlash from '@libs/UrlUtils';
import {clearExportDownload, sendExportFileFromConcierge} from '@userActions/Export';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import Modal from './Modal';
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
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {environment} = useEnvironment();

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [encryptedAuthToken] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.encryptedAuthToken});

    const [exportDownload] = useOnyx(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
    const displayedExport = usePreviousDefined(exportDownload);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const state = displayedExport?.state;
    const shouldSendFromConcierge = displayedExport?.shouldSendFromConcierge;
    const fileName = displayedExport?.fileName;
    const isPreparing = state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING && !shouldSendFromConcierge;
    const isConcierge = !!shouldSendFromConcierge;
    const isReady = state === CONST.EXPORT_DOWNLOAD.STATE.READY;
    const isFailed = state === CONST.EXPORT_DOWNLOAD.STATE.FAILED;

    // Build the secure download URL the same way downloadReportPDF does, so the host always follows
    // the app's current environment (instead of the env baked into a backend-built URL) and authenticates
    // via the encryptedAuthToken — no separate OldDot sign-in needed.
    const downloadFile = () => {
        if (!fileName || !currentUserLogin) {
            return;
        }
        const baseURL = addTrailingForwardSlash(getOldDotURLFromEnvironment(environment));
        const url = `${baseURL}secure?secureType=csvexport&filename=${encodeURIComponent(fileName)}&downloadName=${encodeURIComponent(fileName)}&email=${encodeURIComponent(currentUserLogin)}`;
        fileDownload(translate, addEncryptedAuthTokenToURL(url, encryptedAuthToken ?? '', true), fileName);
    };

    useEffect(() => {
        if (!isReady || !fileName || shouldSendFromConcierge) {
            return;
        }
        downloadFile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, fileName, shouldSendFromConcierge]);

    const handleSendFromConcierge = () => {
        sendExportFileFromConcierge(exportID, displayedExport ?? undefined);
    };

    const handleGoToConcierge = () => {
        onClose();
        navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas);
    };

    const handleClose = () => {
        clearExportDownload(exportID, displayedExport ?? undefined);
        onClose();
    };

    const isNonDismissible = isPreparing;

    const renderContent = () => {
        if (isPreparing) {
            return (
                <>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb2]}>
                        <Text style={[styles.textHeadlineH1, styles.flexShrink1]}>{translate('exportDownload.preparingTitle')}</Text>
                        <ActivityIndicator
                            size="small"
                            reasonAttributes={{context: 'ExportDownloadStatusModal.preparing'}}
                        />
                    </View>
                    <Text style={styles.mb5}>{translate('exportDownload.preparingBody')}</Text>
                    <Button
                        text={translate('exportDownload.sendFromConcierge')}
                        onPress={handleSendFromConcierge}
                        style={styles.w100}
                    />
                </>
            );
        }

        if (isConcierge) {
            return (
                <>
                    <Text style={[styles.textHeadlineH1, styles.mb2]}>{translate('exportDownload.conciergeTitle')}</Text>
                    <Text style={styles.mb5}>{translate('exportDownload.conciergeBody')}</Text>
                    <Button
                        success
                        text={translate('exportDownload.goToConcierge')}
                        onPress={handleGoToConcierge}
                        style={styles.w100}
                    />
                    <Button
                        text={translate('exportDownload.dismiss')}
                        onPress={onClose}
                        style={[styles.w100, styles.mt3]}
                    />
                </>
            );
        }

        if (isReady) {
            return (
                <>
                    <Text style={[styles.textHeadlineH1, styles.mb2]}>{translate('exportDownload.readyTitle')}</Text>
                    <Text style={styles.mb5}>{translate('exportDownload.readyBody')}</Text>
                    <Button
                        success
                        text={translate('exportDownload.downloadFile')}
                        onPress={downloadFile}
                        style={styles.w100}
                    />
                    <Button
                        text={translate('exportDownload.close')}
                        onPress={handleClose}
                        style={[styles.w100, styles.mt3]}
                    />
                </>
            );
        }

        if (isFailed) {
            return (
                <>
                    <Text style={[styles.textHeadlineH1, styles.mb2]}>{translate('exportDownload.failedTitle')}</Text>
                    {!!failedBody && <Text style={styles.mb5}>{failedBody}</Text>}
                    <Button
                        text={translate('exportDownload.close')}
                        onPress={handleClose}
                        style={styles.w100}
                    />
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
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
        >
            <View style={styles.m5}>{renderContent()}</View>
        </Modal>
    );
}

ExportDownloadStatusModal.displayName = 'ExportDownloadStatusModal';

export default ExportDownloadStatusModal;
