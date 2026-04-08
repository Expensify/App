import {useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {ButtonWithDropdownMenuRef} from '@components/ButtonWithDropdownMenu/types';
import type {RejectModalAction} from '@components/MoneyReportHeaderEducationalModals';
import MoneyReportHeaderEducationalModals from '@components/MoneyReportHeaderEducationalModals';
import MoneyReportHeaderPrimaryAction from '@components/MoneyReportHeaderPrimaryAction';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import ReportPDFDownloadModal from '@components/ReportPDFDownloadModal';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import useExportAgainModal from '@hooks/useExportAgainModal';
import useNonReimbursablePaymentModal from '@hooks/useNonReimbursablePaymentModal';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import MoneyReportHeaderActionsBar from './MoneyReportHeaderActionsBar';
import MoneyReportHeaderHoldMenu from './MoneyReportHeaderHoldMenu';
import MoneyReportHeaderSecondaryActions from './MoneyReportHeaderSecondaryActions';
import MoneyReportHeaderSelectionDropdown from './MoneyReportHeaderSelectionDropdown';

type MoneyReportHeaderActionsProps = {
    reportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    isPaidAnimationRunning: boolean;
    isApprovedAnimationRunning: boolean;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;
};

/**
 * Narrow the wide primaryAction union to what report-level secondary actions accept.
 * TRANSACTION_PRIMARY_ACTIONS values (e.g. "keepThisOne") are irrelevant here.
 */
function narrowPrimaryAction(primaryAction: MoneyReportHeaderActionsProps['primaryAction']): ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '' {
    if ((Object.values(CONST.REPORT.PRIMARY_ACTIONS) as string[]).includes(primaryAction)) {
        return primaryAction as ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS>;
    }
    return '';
}

function MoneyReportHeaderActions({
    reportID,
    primaryAction,
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    isSubmittingAnimationRunning,
    stopAnimation,
    startAnimation,
    startApprovedAnimation,
    startSubmittingAnimation,
}: MoneyReportHeaderActionsProps) {
    const styles = useThemeStyles();

    // ── Modal state ──
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [selectedVBBAToPayFromHoldMenu, setSelectedVBBAToPayFromHoldMenu] = useState<number | undefined>(undefined);
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<RejectModalAction | null>(null);
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);
    const isSelectionModePaymentRef = useRef(false);
    const dropdownMenuRef = useRef<ButtonWithDropdownMenuRef>(null) as React.RefObject<ButtonWithDropdownMenuRef>;

    // ── Layout ──
    // We need isSmallScreenWidth for the hold expense modal layout https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();
    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    // ── Onyx data ──
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);

    // ── Transaction thread & report actions ──
    const {transactionThreadReportID, transactionThreadReport, reportActions} = useTransactionThreadReport(reportID);

    const {transactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactionsList = Object.values(transactions);
    const transactionIDs = transactionsList.map((t) => t.transactionID);

    // Transaction for educational modal
    const requestParentReportAction =
        reportActions?.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport?.parentReportActionID) ??
        null;
    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);

    // ── Hold menu data ──
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, true);
    const {nonReimbursablePaymentErrorDecisionModal, showNonReimbursablePaymentErrorModal} = useNonReimbursablePaymentModal(moneyRequestReport, transactionsList);

    // ── Export modal ──
    const {triggerExportOrConfirm} = useExportAgainModal(moneyRequestReport?.reportID, moneyRequestReport?.policyID);

    // ── Selection mode ──
    const {selectedTransactionIDs} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const shouldShowSelectedTransactionsButton = !!selectedTransactionIDs.length && !transactionThreadReportID;

    const primaryActionForSecondary = narrowPrimaryAction(primaryAction);

    // ── Callbacks ──
    const onHoldMenuOpen = (actionType: string, payType?: PaymentMethodType, methodID?: number) => {
        setRequestType(actionType as ActionHandledType);
        setPaymentType(payType);
        setSelectedVBBAToPayFromHoldMenu(payType === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined);
        if (getPlatform() === CONST.PLATFORM.IOS) {
            // InteractionManager delays modal until current interaction completes, preventing visual glitches on iOS
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => setIsHoldMenuVisible(true));
        } else {
            setIsHoldMenuVisible(true);
        }
    };

    // ── Sub-elements ──
    const primaryActionElement = (
        <MoneyReportHeaderPrimaryAction
            reportID={reportID}
            chatReportID={chatReport?.reportID}
            primaryAction={primaryAction}
            isPaidAnimationRunning={isPaidAnimationRunning}
            isApprovedAnimationRunning={isApprovedAnimationRunning}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            stopAnimation={stopAnimation}
            startAnimation={startAnimation}
            startApprovedAnimation={startApprovedAnimation}
            startSubmittingAnimation={startSubmittingAnimation}
            onHoldMenuOpen={onHoldMenuOpen}
            onExportModalOpen={() => triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)}
        />
    );

    const secondaryActionsElement = (
        <MoneyReportHeaderSecondaryActions
            reportID={reportID}
            primaryAction={primaryActionForSecondary}
            onHoldMenuOpen={onHoldMenuOpen}
            onPDFModalOpen={() => setIsPDFModalVisible(true)}
            onHoldEducationalOpen={() => setIsHoldEducationalModalVisible(true)}
            onRejectModalOpen={(action) => setRejectModalAction(action)}
            startAnimation={startAnimation}
            startApprovedAnimation={startApprovedAnimation}
            startSubmittingAnimation={startSubmittingAnimation}
            dropdownMenuRef={dropdownMenuRef}
        />
    );

    const selectionDropdownElement = (
        <MoneyReportHeaderSelectionDropdown
            reportID={reportID}
            primaryAction={primaryActionForSecondary}
            onHoldMenuOpen={onHoldMenuOpen}
            onRejectModalOpen={(action) => setRejectModalAction(action)}
            startApprovedAnimation={startApprovedAnimation}
            startSubmittingAnimation={startSubmittingAnimation}
            wrapperStyle={shouldDisplayNarrowMoreButton ? undefined : styles.w100}
        />
    );

    return (
        <>
            <MoneyReportHeaderActionsBar
                primaryAction={primaryAction}
                shouldDisplayNarrowMoreButton={shouldDisplayNarrowMoreButton}
                shouldShowSelectedTransactionsButton={shouldShowSelectedTransactionsButton}
                primaryActionElement={primaryActionElement}
                secondaryActionsElement={secondaryActionsElement}
                selectionDropdownElement={selectionDropdownElement}
            />

            <MoneyReportHeaderHoldMenu
                nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                requestType={requestType}
                fullAmount={fullAmount}
                onClose={() => {
                    setSelectedVBBAToPayFromHoldMenu(undefined);
                    setIsHoldMenuVisible(false);
                    isSelectionModePaymentRef.current = false;
                }}
                isVisible={isHoldMenuVisible}
                paymentType={paymentType}
                methodID={paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? selectedVBBAToPayFromHoldMenu : undefined}
                chatReport={chatReport}
                moneyRequestReport={moneyRequestReport}
                hasNonHeldExpenses={!hasOnlyHeldExpenses}
                startAnimation={() => {
                    if (isSelectionModePaymentRef.current) {
                        clearSelectedTransactions(true);
                        return;
                    }
                    if (requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                        startApprovedAnimation();
                    } else {
                        startAnimation();
                    }
                }}
                transactionCount={transactionIDs.length}
                transactions={transactionsList}
                onNonReimbursablePaymentError={showNonReimbursablePaymentErrorModal}
            />
            <MoneyReportHeaderEducationalModals
                requestParentReportAction={requestParentReportAction}
                transaction={transaction}
                reportID={moneyRequestReport?.reportID}
                isHoldEducationalVisible={isHoldEducationalModalVisible}
                rejectModalAction={rejectModalAction}
                onHoldEducationalDismissed={() => setIsHoldEducationalModalVisible(false)}
                onRejectModalDismissed={() => setRejectModalAction(null)}
            />
            {nonReimbursablePaymentErrorDecisionModal}
            <ReportPDFDownloadModal
                reportID={moneyRequestReport?.reportID}
                isVisible={isPDFModalVisible}
                onClose={() => setIsPDFModalVisible(false)}
            />
        </>
    );
}

export default MoneyReportHeaderActions;
export type {MoneyReportHeaderActionsProps};
