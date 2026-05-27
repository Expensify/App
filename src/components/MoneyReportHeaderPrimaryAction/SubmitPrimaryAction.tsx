import {delegateEmailSelector} from '@selectors/Account';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';
import {ReportSubmitToPopoverAnchor, useOpenReportSubmitToPopover} from '@components/ReportSubmitToPopoverAnchor';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import useConfirmModal from '@hooks/useConfirmModal';
import useConfirmPendingRTERAndProceed from '@hooks/useConfirmPendingRTERAndProceed';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePermissions from '@hooks/usePermissions';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useStrictPolicyRules from '@hooks/useStrictPolicyRules';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {search} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
import {hasViolations as hasViolationsReportUtils, shouldBlockSubmitDueToPreventSelfApproval, shouldBlockSubmitDueToStrictPolicyRules, shouldShowMarkAsDone} from '@libs/ReportUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import {hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils, hasOnlyPendingCardTransactions, showPendingCardTransactionsBlockModal} from '@libs/TransactionUtils';
import {submitReport} from '@userActions/IOU/ReportWorkflow';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import type TransactionViolations from '@src/types/onyx/TransactionViolation';

type SubmitPrimaryActionContentProps = {
    reportID: string | undefined;
    moneyRequestReport: OnyxEntry<OnyxTypes.Report>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    nextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
    transactions: OnyxTypes.Transaction[];
    reportActions: OnyxTypes.ReportAction[];
    hasViolations: boolean;
    hasAnyPendingRTERViolation: boolean;
    isASAPSubmitBetaEnabled: boolean;
    shouldBlockSubmit: boolean;
    accountID: number;
    email: string | undefined;
    delegateEmail: string | undefined;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startSubmittingAnimation: () => void;
    isOffline: boolean;
    currentSearchQueryJSON: SearchQueryJSON | undefined;
    currentSearchKey: SearchKey | undefined;
    currentSearchResults: SearchResults | undefined;
    shouldCalculateTotals: boolean;
    allTransactionViolations: OnyxCollection<TransactionViolations>;
    isTrackIntentUser: boolean;
};

function SubmitPrimaryActionContent({
    reportID,
    moneyRequestReport,
    policy,
    nextStep,
    userBillingGracePeriodEnds,
    amountOwed,
    ownerBillingGracePeriodEnd,
    transactions,
    reportActions,
    hasViolations,
    hasAnyPendingRTERViolation,
    isASAPSubmitBetaEnabled,
    shouldBlockSubmit,
    accountID,
    email,
    delegateEmail,
    isSubmittingAnimationRunning,
    stopAnimation,
    startSubmittingAnimation,
    isOffline,
    currentSearchQueryJSON,
    currentSearchKey,
    currentSearchResults,
    shouldCalculateTotals,
    allTransactionViolations,
    isTrackIntentUser,
}: SubmitPrimaryActionContentProps) {
    const {translate} = useLocalize();
    const openReportSubmitToPopover = useOpenReportSubmitToPopover();

    const handleMarkPendingRTERTransactionsAsCash = () => {
        markPendingRTERTransactionsAsCash(transactions, allTransactionViolations, reportActions);
    };
    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    const {showConfirmModal} = useConfirmModal();

    const shouldUseMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report: moneyRequestReport,
        isTrackIntentUser,
    });

    const handleSubmit = () => {
        if (!moneyRequestReport || shouldBlockSubmit) {
            return;
        }

        if (hasOnlyPendingCardTransactions(transactions)) {
            showPendingCardTransactionsBlockModal(showConfirmModal, translate);
            return;
        }

        confirmPendingRTERAndProceed(() => {
            if (isSubmitPolicy(policy) && reportID) {
                openReportSubmitToPopover();
                return;
            }
            submitReport({
                expenseReport: moneyRequestReport,
                policy,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: nextStep,
                userBillingGracePeriodEnds,
                amountOwed,
                onSubmitted: startSubmittingAnimation,
                ownerBillingGracePeriodEnd,
                delegateEmail,
            });
            if (currentSearchQueryJSON && !isOffline) {
                search({
                    searchKey: currentSearchKey,
                    shouldCalculateTotals,
                    offset: 0,
                    queryJSON: currentSearchQueryJSON,
                    isOffline,
                    isLoading: !!currentSearchResults?.search?.isLoading,
                });
            }
        });
    };

    return (
        <AnimatedSubmitButton
            success
            text={shouldUseMarkAsDoneCopy ? translate('common.markAsDone') : translate('common.submit')}
            isMarkAsDone={shouldUseMarkAsDoneCopy}
            onPress={handleSubmit}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            onAnimationFinish={stopAnimation}
            isDisabled={shouldBlockSubmit}
        />
    );
}

type SubmitPrimaryActionProps = {
    reportID: string | undefined;
};

function SubmitPrimaryAction({reportID}: SubmitPrimaryActionProps) {
    const {isSubmittingAnimationRunning, stopAnimation, startSubmittingAnimation} = usePaymentAnimationsContext();
    const {isOffline} = useNetwork();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});

    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactions);
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');
    const hasAnyPendingRTERViolation = hasAnyPendingRTERViolationTransactionUtils(transactions, allTransactionViolations, email ?? '', accountID, moneyRequestReport, policy);

    const isBlockSubmitDueToPreventSelfApproval = shouldBlockSubmitDueToPreventSelfApproval(moneyRequestReport, policy);
    const isBlockSubmitDueToStrictPolicyRules = shouldBlockSubmitDueToStrictPolicyRules(
        moneyRequestReport?.reportID,
        violations,
        areStrictPolicyRulesEnabled,
        accountID,
        email ?? '',
        transactions,
    );
    const shouldBlockSubmit = isBlockSubmitDueToStrictPolicyRules || isBlockSubmitDueToPreventSelfApproval;

    const {currentSearchQueryJSON, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    return (
        <ReportSubmitToPopoverAnchor
            reportID={reportID}
            onSubmitSuccess={startSubmittingAnimation}
        >
            <SubmitPrimaryActionContent
                reportID={reportID}
                moneyRequestReport={moneyRequestReport}
                policy={policy}
                nextStep={nextStep}
                userBillingGracePeriodEnds={userBillingGracePeriodEnds}
                amountOwed={amountOwed}
                ownerBillingGracePeriodEnd={ownerBillingGracePeriodEnd}
                transactions={transactions}
                reportActions={reportActions}
                hasViolations={hasViolations}
                hasAnyPendingRTERViolation={hasAnyPendingRTERViolation}
                isASAPSubmitBetaEnabled={isASAPSubmitBetaEnabled}
                shouldBlockSubmit={shouldBlockSubmit}
                accountID={accountID}
                email={email}
                delegateEmail={delegateEmail}
                isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                stopAnimation={stopAnimation}
                startSubmittingAnimation={startSubmittingAnimation}
                isOffline={isOffline}
                currentSearchQueryJSON={currentSearchQueryJSON}
                currentSearchKey={currentSearchKey}
                currentSearchResults={currentSearchResults}
                shouldCalculateTotals={shouldCalculateTotals}
                allTransactionViolations={allTransactionViolations}
                isTrackIntentUser={isTrackIntentUser ?? false}
            />
        </ReportSubmitToPopoverAnchor>
    );
}

export default SubmitPrimaryAction;
