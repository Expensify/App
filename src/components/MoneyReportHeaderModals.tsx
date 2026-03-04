import {shouldFailAllRequestsSelector} from '@selectors/Network';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {downloadReportPDF, exportReportToPDF} from '@libs/actions/Report';
import {setNameValuePair} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import {changeMoneyRequestHoldStatus, rejectMoneyRequestReason} from '@libs/ReportUtils';
import {dismissRejectUseExplanation} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import DecisionModal from './DecisionModal';
import Header from './Header';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from './HoldSubmitterEducationalModal';
import Icon from './Icon';
import Modal from './Modal';
import type {RejectModalActionType} from './MoneyReportHeaderContext';
import {PressableWithFeedback} from './Pressable';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import Text from './Text';

type MoneyReportHeaderModalsProps = {
    /** The money request report */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The chat report associated with the money request report */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** Whether the report has only held expenses */
    hasOnlyHeldExpenses: boolean;

    /** Whether the report has valid non-held amount */
    hasValidNonHeldAmount: boolean;

    /** The non-held amount string */
    nonHeldAmount: string;

    /** The full amount string */
    fullAmount: string;

    /** Transaction IDs count */
    transactionCount: number;

    /** The parent report action for the request */
    requestParentReportAction: OnyxTypes.ReportAction | null | undefined;

    /** Start pay animation */
    startAnimation: () => void;

    /** Start approved animation */
    startApprovedAnimation: () => void;

    /** Callback to register modal triggers into parent context */
    onRegisterTriggers: (triggers: {
        showHoldMenu: (paymentType?: PaymentMethodType, requestType?: ActionHandledType) => void;
        showDownloadError: () => void;
        showExportDownloadError: () => void;
        showOfflineModal: () => void;
        showPDFModal: (reportID: string) => void;
        showHoldEducationalModal: () => void;
        setRejectModalAction: (action: RejectModalActionType) => void;
        showRateErrorModal: () => void;
        showDuplicatePerDiemErrorModal: () => void;
    }) => void;
};

function MoneyReportHeaderModals({
    report,
    chatReport,
    hasOnlyHeldExpenses,
    hasValidNonHeldAmount,
    nonHeldAmount,
    fullAmount,
    transactionCount,
    requestParentReportAction,
    startAnimation,
    startApprovedAnimation,
    onRegisterTriggers,
}: MoneyReportHeaderModalsProps) {
    const {translate} = useLocalize();
    // isSmallScreenWidth needed for correct modal type selection (shouldUseNarrowLayout has different breakpoints)
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close'] as const);

    const [shouldFailAllRequests] = useOnyx(ONYXKEYS.NETWORK, {selector: shouldFailAllRequestsSelector});
    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${report?.reportID}`) ?? null;
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';

    // Modal state
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [offlineModalVisible, setOfflineModalVisible] = useState(false);
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rateErrorModalVisible, setRateErrorModalVisible] = useState(false);
    const [duplicatePerDiemErrorModalVisible, setDuplicatePerDiemErrorModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalActionState] = useState<RejectModalActionType | null>(null);

    const canTriggerAutomaticPDFDownload = useRef(false);
    const hasFinishedPDFDownload = reportPDFFilename && reportPDFFilename !== CONST.REPORT_DETAILS_MENU_ITEM.ERROR;

    useEffect(() => {
        canTriggerAutomaticPDFDownload.current = isPDFModalVisible;
    }, [isPDFModalVisible]);

    useEffect(() => {
        if (!hasFinishedPDFDownload || !canTriggerAutomaticPDFDownload.current) {
            return;
        }
        downloadReportPDF(reportPDFFilename, report?.reportName ?? '', translate, currentUserLogin ?? '', encryptedAuthToken);
        canTriggerAutomaticPDFDownload.current = false;
    }, [hasFinishedPDFDownload, reportPDFFilename, report?.reportName, translate, currentUserLogin, encryptedAuthToken]);

    const messagePDF = useMemo(() => {
        if (reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR) {
            return translate('reportDetailsPage.errorPDF');
        }
        if (!hasFinishedPDFDownload) {
            return translate('reportDetailsPage.waitForPDF');
        }
        return translate('reportDetailsPage.successPDF');
    }, [reportPDFFilename, hasFinishedPDFDownload, translate]);

    // Register triggers on mount so parent can call them via context
    useEffect(() => {
        onRegisterTriggers({
            showHoldMenu: (pt?: PaymentMethodType, rt?: ActionHandledType) => {
                setPaymentType(pt);
                setRequestType(rt);
                setIsHoldMenuVisible(true);
            },
            showDownloadError: () => setDownloadErrorModalVisible(true),
            showExportDownloadError: () => setIsDownloadErrorModalVisible(true),
            showOfflineModal: () => setOfflineModalVisible(true),
            showPDFModal: (reportID: string) => {
                setIsPDFModalVisible(true);
                exportReportToPDF({reportID});
            },
            showHoldEducationalModal: () => setIsHoldEducationalModalVisible(true),
            setRejectModalAction: (action: RejectModalActionType) => setRejectModalActionState(action),
            showRateErrorModal: () => setRateErrorModalVisible(true),
            showDuplicatePerDiemErrorModal: () => setDuplicatePerDiemErrorModalVisible(true),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Triggers registered once on mount; re-registration would cause stale closures via onRegisterTriggers identity changes
    }, []);

    const dismissModalAndUpdateUseHold = useCallback(() => {
        setIsHoldEducationalModalVisible(false);
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !shouldFailAllRequests);
        if (requestParentReportAction) {
            changeMoneyRequestHoldStatus(requestParentReportAction);
        }
    }, [shouldFailAllRequests, requestParentReportAction]);

    const dismissRejectModalBasedOnAction = useCallback(() => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (requestParentReportAction) {
                changeMoneyRequestHoldStatus(requestParentReportAction);
            }
        } else if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK) {
            dismissRejectUseExplanation();
            if (report?.reportID) {
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS.getRoute({reportID: report.reportID}));
            }
        } else {
            dismissRejectUseExplanation();
            if (requestParentReportAction) {
                rejectMoneyRequestReason(requestParentReportAction);
            }
        }
        setRejectModalActionState(null);
    }, [rejectModalAction, requestParentReportAction, report?.reportID]);

    return (
        <>
            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    onClose={() => setIsHoldMenuVisible(false)}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    chatReport={chatReport}
                    moneyRequestReport={report}
                    hasNonHeldExpenses={!hasOnlyHeldExpenses}
                    startAnimation={() => {
                        if (requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                            startApprovedAnimation();
                        } else {
                            startAnimation();
                        }
                    }}
                    transactionCount={transactionCount}
                />
            )}
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={downloadErrorModalVisible}
                onClose={() => setDownloadErrorModalVisible(false)}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={() => setIsDownloadErrorModalVisible(false)}
            />
            <ConfirmModal
                title={translate('common.duplicateExpense')}
                isVisible={rateErrorModalVisible}
                onConfirm={() => setRateErrorModalVisible(false)}
                onCancel={() => setRateErrorModalVisible(false)}
                confirmText={translate('common.buttonConfirm')}
                prompt={translate('iou.correctRateError')}
                shouldShowCancelButton={false}
            />
            <ConfirmModal
                title={translate('common.duplicateExpense')}
                isVisible={duplicatePerDiemErrorModalVisible}
                onConfirm={() => setDuplicatePerDiemErrorModalVisible(false)}
                onCancel={() => setDuplicatePerDiemErrorModalVisible(false)}
                confirmText={translate('common.buttonConfirm')}
                prompt={translate('iou.duplicateNonDefaultWorkspacePerDiemError')}
                shouldShowCancelButton={false}
            />
            {!!rejectModalAction && (
                <HoldOrRejectEducationalModal
                    onClose={dismissRejectModalBasedOnAction}
                    onConfirm={dismissRejectModalBasedOnAction}
                />
            )}
            {!!isHoldEducationalModalVisible && (
                <HoldSubmitterEducationalModal
                    onClose={dismissModalAndUpdateUseHold}
                    onConfirm={dismissModalAndUpdateUseHold}
                />
            )}
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={offlineModalVisible}
                onClose={() => setOfflineModalVisible(false)}
            />
            <Modal
                onClose={() => {
                    setIsPDFModalVisible(false);
                }}
                isVisible={isPDFModalVisible}
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
                                    />
                                </View>
                            )}
                        </View>
                        <Button
                            style={[styles.mt3, styles.noSelect]}
                            onPress={() => {
                                if (!hasFinishedPDFDownload) {
                                    setIsPDFModalVisible(false);
                                } else {
                                    downloadReportPDF(reportPDFFilename, report?.reportName ?? '', translate, currentUserLogin ?? '', encryptedAuthToken);
                                }
                            }}
                            text={hasFinishedPDFDownload ? translate('common.download') : translate('common.cancel')}
                        />
                    </View>
                    <PressableWithFeedback
                        onPress={() => {
                            setIsPDFModalVisible(false);
                        }}
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
        </>
    );
}

MoneyReportHeaderModals.displayName = 'MoneyReportHeaderModals';

export default MoneyReportHeaderModals;
