import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {downloadReportPDF} from '@libs/actions/Report';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import Header from './Header';
import Icon from './Icon';
import Modal from './Modal';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type ReportPDFDownloadModalProps = {
    reportID: string | undefined;
    isVisible: boolean;
    onClose: () => void;
};

function ReportPDFDownloadModal({reportID, isVisible, onClose}: ReportPDFDownloadModalProps) {
    const shouldAutoDownloadPDF = useRef(false);

    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${reportID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth here because the Modal breaks in RHP with shouldUseNarrowLayout.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails?.login ?? '';
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';
    const reportName = report?.reportName ?? '';

    const hasFinishedPDFDownload = reportPDFFilename && reportPDFFilename !== CONST.REPORT_DETAILS_MENU_ITEM.ERROR;

    const messagePDF = (() => {
        if (reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR) {
            return translate('reportDetailsPage.errorPDF');
        }
        if (!hasFinishedPDFDownload) {
            return translate('reportDetailsPage.waitForPDF');
        }
        return translate('reportDetailsPage.successPDF');
    })();

    useEffect(() => {
        shouldAutoDownloadPDF.current = isVisible;
    }, [isVisible]);

    useEffect(() => {
        if (!hasFinishedPDFDownload || !shouldAutoDownloadPDF.current) {
            return;
        }
        downloadReportPDF(reportPDFFilename, reportName, translate, currentUserLogin ?? '', encryptedAuthToken);
        shouldAutoDownloadPDF.current = false;
    }, [hasFinishedPDFDownload, reportPDFFilename, reportName, translate, currentUserLogin, encryptedAuthToken]);

    const pdfLoadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MoneyReportHeader.PDFModal',
    };

    return (
        <Modal
            onClose={onClose}
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
                            <Text style={[styles.mt5, styles.textAlignLeft]}>{messagePDF}</Text>
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
                        onPress={() => {
                            if (!hasFinishedPDFDownload) {
                                onClose();
                            } else {
                                downloadReportPDF(reportPDFFilename, reportName, translate, currentUserLogin ?? '', encryptedAuthToken);
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

export default ReportPDFDownloadModal;
