import DecisionModal from '@components/DecisionModal';
import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';

import useChangeTransactionsReportReports from '@hooks/useChangeTransactionsReportReports';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useHasPerDiemTransactions from '@hooks/useHasPerDiemTransactions';
import useHydrateReportsFromSnapshot from '@hooks/useHydrateReportsFromSnapshot';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {createNewReport} from '@libs/actions/Report';
import {autoReportTransactions, changeTransactionsReport} from '@libs/actions/Transaction';
import getAllMatchingQueryParams from '@libs/getAllMatchingQueryParams';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID, getPersonalDetailsForAccountID, getReportOrDraftReport, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {
    isDistanceRequest as isDistanceRequestUtil,
    isManagedCardTransaction,
    isManualDistanceRequest as isManualDistanceRequestUtil,
    isOdometerDistanceRequest as isOdometerDistanceRequestUtil,
    isUnreportedManagedCardTransaction,
} from '@libs/TransactionUtils';

import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {PersonalDetails, Transaction} from '@src/types/onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useMemo, useState} from 'react';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

function SearchTransactionsChangeReport() {
    const {selectedTransactions, areAllMatchingItemsSelected, excludedTransactions} = useSearchSelectionContext();
    const delegateAccountID = useDelegateAccountID();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);

    const allMatchingQueryParams = getAllMatchingQueryParams(areAllMatchingItemsSelected, excludedTransactions, currentSearchQueryJSON);

    /**
     * A queued all-matching move would replay a stale query on reconnect. The backend resolves the match set when it
     * runs the query, not when the user submitted it, so expenses that started matching while offline get swept in.
     * `useSearchBulkActions` only checks this when the user opens this RHP, so check again in case the connection
     * dropped since then, and ask the user to reconnect like export does.
     */
    const shouldBlockOfflineAllMatchingMove = () => isOffline && !!allMatchingQueryParams.jsonQuery;

    // Search-selected transactions are not in COLLECTION.TRANSACTION — extract from `selectedTransactions` directly.
    const transactions = Object.values(selectedTransactions)
        .map((transactionItem) => transactionItem.transaction)
        .filter((transaction): transaction is Transaction => !!transaction);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const personalPolicy = usePersonalPolicy();
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(selfDMReportID)}`);
    const hasPerDiemTransactions = useHasPerDiemTransactions(selectedTransactionsKeys);
    const managedCardTransactionID = transactions.find((transaction) => isUnreportedManagedCardTransaction(transaction))?.transactionID;
    const hasUnreportedManagedCardTransactions = !!managedCardTransactionID;
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const reports = useChangeTransactionsReportReports(transactions, undefined);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const firstTransactionKey = selectedTransactionsKeys.at(0);
    const firstTransactionReportID = firstTransactionKey ? selectedTransactions[firstTransactionKey]?.reportID : undefined;
    const selectedReportID =
        Object.values(selectedTransactions).every((transaction) => transaction.reportID === firstTransactionReportID) && firstTransactionReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
            ? firstTransactionReportID
            : undefined;
    // Get the policyID from the selected transactions' report to pass to usePolicyForMovingExpenses
    // This ensures the "Create report" button shows the correct workspace instead of the user's default
    const selectedReportPolicyID = selectedReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`]?.policyID : undefined;
    const {policyForMovingExpensesID, shouldSelectPolicy, shouldNavigateToUpgradePath} = usePolicyForMovingExpenses(
        hasPerDiemTransactions,
        undefined,
        selectedReportPolicyID,
        hasUnreportedManagedCardTransactions,
    );
    const policyForMovingExpenses = policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined;
    const areAllTransactionsUnreported =
        selectedTransactionsKeys.length > 0 && selectedTransactionsKeys.every((transactionKey) => selectedTransactions[transactionKey]?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID);
    const targetOwnerAccountID = useMemo(() => {
        if (selectedTransactionsKeys.length === 0) {
            return undefined;
        }

        // Prefer owner metadata attached to each selection (handles unreported expenses)
        const ownerFromSelection = selectedTransactionsKeys.map((transactionKey) => selectedTransactions[transactionKey]?.ownerAccountID).find((ownerID) => typeof ownerID === 'number');
        if (ownerFromSelection !== undefined) {
            return ownerFromSelection;
        }

        const reportIDWithOwner = selectedTransactionsKeys
            .map((transactionKey) => selectedTransactions[transactionKey]?.reportID)
            .find((reportID) => reportID && reportID !== CONST.REPORT.UNREPORTED_REPORT_ID);

        if (!reportIDWithOwner) {
            return undefined;
        }

        const report = getReportOrDraftReport(reportIDWithOwner, undefined, undefined, undefined, allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDWithOwner}`]);
        return report?.ownerAccountID;
    }, [selectedTransactions, selectedTransactionsKeys, allReports]);
    const targetOwnerPersonalDetails = useMemo(() => getPersonalDetailsForAccountID(targetOwnerAccountID, personalDetails) as PersonalDetails, [personalDetails, targetOwnerAccountID]);
    // Kept separate from `targetOwnerAccountID`, which stops at the first owner it finds. Counting needs them all.
    // Only distinct resolved owners count. An owner we cannot resolve must not stand in for a second submitter: for an
    // unreported expense the report lookup can never resolve one (its reportID is `0`), so a search snapshot missing
    // the money-request action would otherwise file one cardholder's bulk selection as mixed and strip its report list.
    // "Auto report" has the backend resolve each destination through the expense's card, so one expense without a card
    // fails the whole request with "404 Card not found".
    const areAllManagedCardTransactions = selectedTransactionsKeys.length > 0 && transactions.length === selectedTransactionsKeys.length && transactions.every(isManagedCardTransaction);
    const hasMultipleSubmitters = useMemo(() => {
        const ownerAccountIDs = new Set<number>();

        for (const transactionKey of selectedTransactionsKeys) {
            const selection = selectedTransactions[transactionKey];
            const reportID = selection?.reportID;
            const ownerAccountID =
                selection?.ownerAccountID ?? getReportOrDraftReport(reportID, undefined, undefined, undefined, allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`])?.ownerAccountID;

            if (typeof ownerAccountID === 'number') {
                ownerAccountIDs.add(ownerAccountID);
            }
        }

        return ownerAccountIDs.size > 1;
    }, [selectedTransactions, selectedTransactionsKeys, allReports]);

    useHydrateReportsFromSnapshot(currentSearchResults, allReports);

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        const optimisticReport = createNewReport(
            targetOwnerPersonalDetails,
            hasViolations,
            isASAPSubmitBetaEnabled,
            policyForMovingExpenses,
            isTrackIntentUser,
            getCurrencyDecimals,
            rules,
            false,
            shouldDismissEmptyReportsConfirmation,
            {managedCardTransactionID},
        );
        const policyTagList = policyForMovingExpenses?.id ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyForMovingExpenses.id}`] : {};
        const reportsForCall = {
            ...reports,
            [`${ONYXKEYS.COLLECTION.REPORT}${optimisticReport.reportID}`]: {...optimisticReport, transactionCount: 0, unheldNonReimbursableTotal: 0},
        };
        setNavigationActionToMicrotaskQueue(() => {
            changeTransactionsReport({
                isVendorMatchingBetaEnabled,
                transactionIDs: selectedTransactionsKeys,
                isASAPSubmitBetaEnabled,
                accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                email: session?.email ?? '',
                newReport: optimisticReport,
                policy: policyForMovingExpenses,
                policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyForMovingExpensesID}`],
                policyTagList,
                transactions,
                allTransactionViolation: transactionViolations,
                reports: reportsForCall,
                rules,
                isTrackIntentUser,
                personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                selfDMReportActions,
                delegateAccountID,
                getCurrencyDecimals,
                getCurrencySymbol,
                ...allMatchingQueryParams,
            });
            clearSelectedTransactions();
        });
        Navigation.goBack();
    };

    const {handleCreateReport} = useConditionalCreateEmptyReportConfirmation({
        policyID: policyForMovingExpensesID,
        policyName: policyForMovingExpenses?.name ?? '',
        onCreateReport: createReportForPolicy,
        shouldBypassConfirmation: true,
    });

    const createReport = () => {
        if (shouldBlockOfflineAllMatchingMove()) {
            setIsOfflineModalVisible(true);
            return;
        }
        if (shouldNavigateToUpgradePath && selectedTransactionsKeys.length > 0) {
            const firstTransactionID = selectedTransactionsKeys.at(0);
            if (firstTransactionID) {
                Navigation.navigate(
                    createDynamicRoute(
                        DYNAMIC_ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                            action: CONST.IOU.ACTION.EDIT,
                            iouType: CONST.IOU.TYPE.SUBMIT,
                            transactionID: firstTransactionID,
                            reportID: selectedTransactions[firstTransactionID]?.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID,
                            upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                        }),
                    ),
                );
            }
            return;
        }

        if (shouldSelectPolicy) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true)));
            return;
        }
        if (shouldNavigateToUpgradePath) {
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        action: CONST.IOU.ACTION.CREATE,
                        iouType: CONST.IOU.TYPE.CREATE,
                        transactionID: generateReportID(),
                        reportID: generateReportID(),
                        upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                    }),
                ),
            );
            return;
        }
        if (
            policyForMovingExpensesID &&
            policyForMovingExpenses &&
            shouldRestrictUserBillableActions(policyForMovingExpenses, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, session?.accountID ?? CONST.DEFAULT_NUMBER_ID)
        ) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyForMovingExpensesID));
            return;
        }
        handleCreateReport();
    };

    const selectReport = (item: TransactionGroupListItem) => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }
        if (shouldBlockOfflineAllMatchingMove()) {
            setIsOfflineModalVisible(true);
            return;
        }

        const destinationReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.value}`];
        const policyTagList = item?.policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${item.policyID}`] : {};
        const reportsForCall = destinationReport?.reportID
            ? {
                  [`${ONYXKEYS.COLLECTION.REPORT}${destinationReport.reportID}`]: destinationReport,
                  ...reports,
              }
            : reports;
        changeTransactionsReport({
            isVendorMatchingBetaEnabled,
            transactionIDs: selectedTransactionsKeys,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            newReport: destinationReport,
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
            policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
            policyTagList,
            transactions,
            allTransactionViolation: transactionViolations,
            reports: reportsForCall,
            rules,
            isTrackIntentUser,
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
            selfDMReportActions,
            delegateAccountID,
            getCurrencyDecimals,
            getCurrencySymbol,
            ...allMatchingQueryParams,
        });
        Navigation.goBack(undefined, {afterTransition: clearSelectedTransactions});
    };

    const autoReport = () => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }
        autoReportTransactions(selectedTransactionsKeys);
        Navigation.goBack(undefined, {afterTransition: clearSelectedTransactions});
    };

    const removeFromReport = () => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }
        if (shouldBlockOfflineAllMatchingMove()) {
            setIsOfflineModalVisible(true);
            return;
        }
        const policyTagList = personalPolicyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${personalPolicyID}`] : {};
        changeTransactionsReport({
            isVendorMatchingBetaEnabled,
            transactionIDs: selectedTransactionsKeys,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`],
            policyTagList,
            transactions,
            allTransactionViolation: transactionViolations,
            reports,
            rules,
            isTrackIntentUser,
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
            selfDMReportActions,
            delegateAccountID,
            getCurrencyDecimals,
            getCurrencySymbol,
            ...allMatchingQueryParams,
        });
        clearSelectedTransactions();
        Navigation.goBack();
    };

    return (
        <>
            <IOURequestEditReportCommon
                backTo={undefined}
                transactionIDs={selectedTransactionsKeys}
                isManualDistanceRequest={transactions.some(isManualDistanceRequestUtil)}
                isOdometerDistanceRequest={transactions.some(isOdometerDistanceRequestUtil)}
                isDistanceRequest={transactions.some(isDistanceRequestUtil)}
                selectedReportID={selectedReportID}
                selectReport={selectReport}
                removeFromReport={removeFromReport}
                createReport={createReport}
                isEditing
                isUnreported={areAllTransactionsUnreported}
                targetOwnerAccountID={targetOwnerAccountID}
                transactionPolicyID={selectedReportPolicyID}
                isPerDiemRequest={hasPerDiemTransactions}
                isUnreportedManagedCardTransaction={hasUnreportedManagedCardTransactions}
                hasMultipleSubmitters={hasMultipleSubmitters}
                areAllManagedCardTransactions={areAllManagedCardTransactions}
                autoReport={autoReport}
            />
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isOfflineModalVisible}
                onClose={() => setIsOfflineModalVisible(false)}
            />
        </>
    );
}

export default SearchTransactionsChangeReport;
