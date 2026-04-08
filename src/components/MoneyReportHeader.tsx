import {useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportPrimaryAction from '@hooks/useReportPrimaryAction';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useStrictPolicyRules from '@hooks/useStrictPolicyRules';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {
    buildOptimisticNextStepForDEWOffline,
    buildOptimisticNextStepForDynamicExternalWorkflowApproveError,
    buildOptimisticNextStepForDynamicExternalWorkflowSubmitError,
    buildOptimisticNextStepForStrictPolicyRuleViolations,
    getReportNextStep,
} from '@libs/NextStepUtils';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {
    getFilteredReportActionsForReportView,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    hasPendingDEWApprove,
    hasPendingDEWSubmit,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import {
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getReasonAndReportActionThatRequiresAttention,
    isInvoiceReport as isInvoiceReportUtil,
    isOpenExpenseReport,
    isReportOwner,
    shouldBlockSubmitDueToStrictPolicyRules,
} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ButtonWithDropdownMenuRef} from './ButtonWithDropdownMenu/types';
import HeaderLoadingBar from './HeaderLoadingBar';
import HeaderWithBackButton from './HeaderWithBackButton';
import MoneyReportHeaderActions from './MoneyReportHeaderActions';
import MoneyReportHeaderModals from './MoneyReportHeaderModals';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyReportHeaderStatusBarSection from './MoneyReportHeaderStatusBarSection';
import MoneyReportHeaderStatusBarSkeleton from './MoneyReportHeaderStatusBarSkeleton';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';
import {useSearchActionsContext} from './Search/SearchContext';

type MoneyReportHeaderProps = {
    /** The reportID of the report currently being looked at */
    reportID: string | undefined;

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeader({reportID, shouldDisplayBackButton = false, onBackButtonPress}: MoneyReportHeaderProps) {
    return (
        <MoneyReportHeaderModals reportID={reportID}>
            <MoneyReportHeaderContent
                reportID={reportID}
                shouldDisplayBackButton={shouldDisplayBackButton}
                onBackButtonPress={onBackButtonPress}
            />
        </MoneyReportHeaderModals>
    );
}

function MoneyReportHeaderContent({reportID: reportIDProp, shouldDisplayBackButton = false, onBackButtonPress}: MoneyReportHeaderProps) {
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDProp}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [reportMetadataInternal] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDProp}`);
    const isLoadingInitialReportActions = reportMetadataInternal?.isLoadingInitialReportActions;
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {accountID, email} = currentUserPersonalDetails;
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`);
    const {isOffline} = useNetwork();
    const allReportTransactions = useReportTransactionsCollection(reportIDProp);
    const nonDeletedTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactionsForThreadID = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactionsForThreadID?.map((t) => t.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(moneyRequestReport, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReport?.reportID}`);

    const {translate} = useLocalize();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();

    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);

    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const transactions = Object.values(reportTransactions);

    const isBlockSubmitDueToStrictPolicyRules = useMemo(() => {
        return shouldBlockSubmitDueToStrictPolicyRules(moneyRequestReport?.reportID, violations, areStrictPolicyRulesEnabled, accountID, email ?? '', transactions);
    }, [moneyRequestReport?.reportID, violations, areStrictPolicyRulesEnabled, accountID, email, transactions]);

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);

    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const isDEWPolicy = hasDynamicExternalWorkflow(policy);

    const {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning, startAnimation, stopAnimation, startApprovedAnimation, startSubmittingAnimation} =
        usePaymentAnimations();
    const styles = useThemeStyles();
    const theme = useTheme();

    const [isDuplicateReportActive] = useThrottledButtonState();
    const dropdownMenuRef = useRef<ButtonWithDropdownMenuRef>(null);
    const wasDuplicateReportTriggered = useRef(false);

    useEffect(() => {
        if (!isDuplicateReportActive || !wasDuplicateReportTriggered.current) {
            return;
        }
        wasDuplicateReportTriggered.current = false;
        dropdownMenuRef.current?.setIsMenuVisible(false);
    }, [isDuplicateReportActive]);

    const policyType = policy?.type;

    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);

    const {clearSelectedTransactions} = useSearchActionsContext();

    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();

    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;

    const {shouldShowStatusBar, statusBarType} = useMoneyReportHeaderStatusBar(reportIDProp, moneyRequestReport?.chatReportID);

    let optimisticNextStep = getReportNextStep(nextStep, moneyRequestReport, transactions, policy, allTransactionViolations, email ?? '', accountID);

    // Check for DEW submit/approve failed or pending - show appropriate next step
    if (isDEWPolicy && (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN || moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED)) {
        if (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN) {
            const reportActionsObject = reportActions.reduce<OnyxTypes.ReportActions>((acc, action) => {
                if (action.reportActionID) {
                    acc[action.reportActionID] = action;
                }
                return acc;
            }, {});
            const {errors} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(moneyRequestReport, reportActionsObject);

            if (errors?.dewSubmitFailed) {
                optimisticNextStep = buildOptimisticNextStepForDynamicExternalWorkflowSubmitError(theme.danger);
            } else if (isOffline && hasPendingDEWSubmit(reportMetadata, isDEWPolicy)) {
                optimisticNextStep = buildOptimisticNextStepForDEWOffline();
            }
        } else if (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED) {
            const gbrResult = getReasonAndReportActionThatRequiresAttention(moneyRequestReport, undefined, isArchivedReport);
            const hasDEWApproveFailed = gbrResult?.reason === CONST.REQUIRES_ATTENTION_REASONS.HAS_DEW_APPROVE_FAILED;
            const isCurrentUserTheApprover = moneyRequestReport?.managerID === accountID;
            if (hasDEWApproveFailed && isCurrentUserTheApprover) {
                optimisticNextStep = buildOptimisticNextStepForDynamicExternalWorkflowApproveError(theme.danger);
            } else if (isOffline && hasPendingDEWApprove(reportMetadata, isDEWPolicy)) {
                optimisticNextStep = buildOptimisticNextStepForDEWOffline();
            }
        }
    }

    if (isBlockSubmitDueToStrictPolicyRules && isReportOwner(moneyRequestReport) && isOpenExpenseReport(moneyRequestReport)) {
        optimisticNextStep = buildOptimisticNextStepForStrictPolicyRuleViolations();
    }

    const shouldShowNextStep = isFromPaidPolicy && !isInvoiceReport && !shouldShowStatusBar;
    const isReportInRHP = route.name !== SCREENS.REPORT;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;

    let runningAction: 'pay' | 'submit' | undefined;
    if (isPaidAnimationRunning || isApprovedAnimationRunning) {
        runningAction = 'pay';
    } else if (isSubmittingAnimationRunning) {
        runningAction = 'submit';
    }
    const primaryAction = useReportPrimaryAction({
        reportID: reportIDProp,
        runningAction,
    });

    useEffect(() => {
        if (!transactionThreadReportID) {
            return;
        }
        clearSelectedTransactions(true);
        // We don't need to run the effect on change of clearSelectedTransactions since it can cause the infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionThreadReportID]);

    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;

    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    useEffect(() => {
        return () => {
            turnOffMobileSelectionMode();
        };
    }, []);

    if (isMobileSelectionModeEnabled && shouldUseNarrowLayout) {
        // If mobile selection mode is enabled but only one or no transactions remain, turn it off
        const visibleTransactions = transactions.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);
        if (visibleTransactions.length <= 1) {
            turnOffMobileSelectionMode();
        }

        return (
            <HeaderWithBackButton
                title={translate('common.selectMultiple')}
                onBackButtonPress={() => {
                    clearSelectedTransactions(true);
                    turnOffMobileSelectionMode();
                }}
            />
        );
    }

    const showNextStepBar = shouldShowNextStep && !!optimisticNextStep && (('message' in optimisticNextStep && !!optimisticNextStep.message?.length) || 'messageKey' in optimisticNextStep);
    const showNextStepSkeleton = shouldShowNextStep && !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline;
    const shouldShowMoreContent = showNextStepBar || showNextStepSkeleton || !!statusBarType || isReportInSearch;

    const nextStepSkeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MoneyReportHeader',
        shouldShowNextStep,
        isLoadingInitialReportActions: !!isLoadingInitialReportActions,
        isOffline,
        hasOptimisticNextStep: !!optimisticNextStep,
    };

    return (
        <View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldDisplayStatus
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policy={policy}
                shouldShowBackButton={shouldShowBackButton}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                shouldDisplayHelpButton={!(isReportInRHP && shouldUseNarrowLayout)}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
                shouldEnableDetailPageNavigation
                openParentReportInCurrentTab
            >
                {shouldDisplayNarrowMoreButton && (
                    <MoneyReportHeaderActions
                        reportID={reportIDProp}
                        primaryAction={primaryAction}
                        isPaidAnimationRunning={isPaidAnimationRunning}
                        isApprovedAnimationRunning={isApprovedAnimationRunning}
                        isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                        stopAnimation={stopAnimation}
                        startAnimation={startAnimation}
                        startApprovedAnimation={startApprovedAnimation}
                        startSubmittingAnimation={startSubmittingAnimation}
                        isReportInSearch={isReportInSearch}
                    />
                )}
            </HeaderWithBackButton>
            {!shouldDisplayNarrowMoreButton && (
                <MoneyReportHeaderActions
                    reportID={reportIDProp}
                    primaryAction={primaryAction}
                    isPaidAnimationRunning={isPaidAnimationRunning}
                    isApprovedAnimationRunning={isApprovedAnimationRunning}
                    isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                    stopAnimation={stopAnimation}
                    startAnimation={startAnimation}
                    startApprovedAnimation={startApprovedAnimation}
                    startSubmittingAnimation={startSubmittingAnimation}
                    isReportInSearch={isReportInSearch}
                />
            )}

            {shouldShowMoreContent && (
                <View style={[styles.flexRow, styles.gap2, styles.justifyContentStart, styles.flexNoWrap, styles.ph5, styles.pb3]}>
                    <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.flexWrap, styles.justifyContentCenter]}>
                        {showNextStepBar && <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />}
                        {showNextStepSkeleton && <MoneyReportHeaderStatusBarSkeleton reasonAttributes={nextStepSkeletonReasonAttributes} />}
                        <MoneyReportHeaderStatusBarSection
                            reportID={reportIDProp}
                            statusBarType={statusBarType}
                            iouTransactionID={transaction?.transactionID}
                        />
                    </View>
                    {isReportInSearch && (
                        <MoneyRequestReportNavigation
                            reportID={moneyRequestReport?.reportID}
                            shouldDisplayNarrowVersion={!shouldDisplayNarrowMoreButton}
                        />
                    )}
                </View>
            )}

            <HeaderLoadingBar />
        </View>
    );
}

export default MoneyReportHeader;
