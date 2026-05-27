import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import fileDownload from '@libs/fileDownload';
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

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const [exportDownload] = useOnyx(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
    const displayedExport = usePreviousDefined(exportDownload);

    const state = displayedExport?.state;
    const shouldSendFromConcierge = displayedExport?.shouldSendFromConcierge;
    const downloadURL = displayedExport?.downloadURL;
    const isPreparing = state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING && !shouldSendFromConcierge;
    const isConcierge = !!shouldSendFromConcierge;
    const isReady = state === CONST.EXPORT_DOWNLOAD.STATE.READY;
    const isFailed = state === CONST.EXPORT_DOWNLOAD.STATE.FAILED;

    useEffect(() => {
        if (!isReady || !downloadURL || shouldSendFromConcierge) {
            return;
        }
        fileDownload(translate, downloadURL);
    }, [isReady, downloadURL, translate, shouldSendFromConcierge]);

    const handleSendFromConcierge = () => {
        sendExportFileFromConcierge(exportID, displayedExport ?? undefined);
    };

    const handleGoToConcierge = () => {
        onClose();
        navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas);
    };

    const handleDownloadFile = () => {
        if (!downloadURL) {
            return;
        }
        fileDownload(translate, downloadURL);
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
                    <ActivityIndicator
                        size="large"
                        style={styles.mb4}
                        reasonAttributes={{context: 'ExportDownloadStatusModal.preparing'}}
                    />
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mb2]}>{translate('exportDownload.preparingTitle')}</Text>
                    <Text style={[styles.textAlignCenter, styles.mb5]}>{translate('exportDownload.preparingBody')}</Text>
                    <Button
                        success
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
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mb2]}>{translate('exportDownload.conciergeTitle')}</Text>
                    <Text style={[styles.textAlignCenter, styles.mb5]}>{translate('exportDownload.conciergeBody')}</Text>
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
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mb2]}>{translate('exportDownload.readyTitle')}</Text>
                    <Text style={[styles.textAlignCenter, styles.mb5]}>{translate('exportDownload.readyBody')}</Text>
                    <Button
                        success
                        text={translate('exportDownload.downloadFile')}
                        onPress={handleDownloadFile}
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
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mb2]}>{translate('exportDownload.failedTitle')}</Text>
                    {!!failedBody && <Text style={[styles.textAlignCenter, styles.mb5]}>{failedBody}</Text>}
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
            <View style={[styles.m5, styles.alignItemsCenter]}>{renderContent()}</View>
        </Modal>
    );
}

ExportDownloadStatusModal.displayName = 'ExportDownloadStatusModal';

export default ExportDownloadStatusModal;
