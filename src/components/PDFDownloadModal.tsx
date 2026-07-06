import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import CONST from '@src/CONST';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import Header from './Header';
import Icon from './Icon';
import Modal from './Modal';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type PDFDownloadModalProps = {
    /** Whether the PDF has finished generating and is ready to download */
    hasFinishedPDFDownload: boolean;

    /** Message shown under the header (generating / ready / error copy) */
    message: string;

    /** Downloads the generated PDF; called on auto-download and on the download button press */
    onDownloadPDF: () => void;

    /** Telemetry context for the loading indicator's skeleton span */
    loadingReasonContext: string;

    /** Whether pressing the download button also closes the modal */
    shouldCloseOnDownload?: boolean;

    /** Whether the download button uses the success (green) style once the PDF is ready */
    shouldUseSuccessButton?: boolean;

    /** Whether the modal is visible */
    isVisible: boolean;

    /** Called when the modal is closed */
    onClose: () => void;

    /** Called after the modal has finished hiding */
    onModalHide?: () => void;
};

/**
 * Shared modal for OldDot-generated PDF downloads (report PDFs, Expensify Card statements, etc.). It shows a
 * generating/ready state, auto-downloads once generation finishes while the modal is open, and offers a manual
 * download button. Callers supply the status, copy, and download action for their specific PDF.
 */
function PDFDownloadModal({
    hasFinishedPDFDownload,
    message,
    onDownloadPDF,
    loadingReasonContext,
    shouldCloseOnDownload = false,
    shouldUseSuccessButton = false,
    isVisible,
    onClose,
    onModalHide,
}: PDFDownloadModalProps) {
    const shouldAutoDownloadPDF = useRef(false);

    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth here because the Modal breaks in RHP with shouldUseNarrowLayout.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);

    useEffect(() => {
        shouldAutoDownloadPDF.current = isVisible;
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible || !shouldAutoDownloadPDF.current || !hasFinishedPDFDownload) {
            return;
        }
        onDownloadPDF();
        shouldAutoDownloadPDF.current = false;
    }, [hasFinishedPDFDownload, isVisible, onDownloadPDF]);

    const pdfLoadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context: loadingReasonContext,
    };

    return (
        <Modal
            onClose={onClose}
            onModalHide={onModalHide}
            isVisible={isVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
        >
            <View style={[styles.flexRow, styles.m5]}>
                <View style={[styles.flex1]}>
                    <View style={[styles.flexRow, styles.mb4]}>
                        <View style={[styles.flex1]}>
                            <View style={[styles.flexRow]}>
                                <Header title={translate('reportDetailsPage.generatingPDF')} />
                            </View>
                            <Text style={[styles.mt5, styles.textAlignLeft]}>{message}</Text>
                        </View>

                        {!hasFinishedPDFDownload && (
                            <View style={[styles.dFlex, styles.justifyContentEnd]}>
                                <ActivityIndicator
                                    size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                                    color={theme.textSupporting}
                                    style={styles.ml3}
                                    reasonAttributes={pdfLoadingReasonAttributes}
                                />
                            </View>
                        )}
                    </View>
                    <Button
                        style={[styles.mt3, styles.noSelect]}
                        success={shouldUseSuccessButton && hasFinishedPDFDownload}
                        onPress={() => {
                            if (!hasFinishedPDFDownload) {
                                onClose();
                                return;
                            }

                            onDownloadPDF();
                            if (shouldCloseOnDownload) {
                                onClose();
                            }
                        }}
                        text={hasFinishedPDFDownload ? translate('common.download') : translate('common.cancel')}
                    />
                </View>
                <PressableWithFeedback
                    onPress={onClose}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.close')}
                    wrapperStyle={[styles.pAbsolute, styles.r0]}
                    sentryLabel={CONST.SENTRY_LABEL.MORE_MENU.CLOSE_PDF_MODAL}
                >
                    <Icon
                        src={expensifyIcons.Close}
                        fill={theme.icon}
                    />
                </PressableWithFeedback>
            </View>
        </Modal>
    );
}

PDFDownloadModal.displayName = 'PDFDownloadModal';

export default PDFDownloadModal;
