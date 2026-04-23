import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import useHasPerDiemTransactions from '@hooks/useHasPerDiemTransactions';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {createNewReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, Report} from '@src/types/onyx';
import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type IOURequestEditReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.EDIT_REPORT>;

function IOURequestEditReport({route}: IOURequestEditReportProps) {
    const {backTo, reportID, action, shouldTurnOffSelectionMode, transactionID: transactionIDFromParams} = route.params;
    const {selectedTransactionIDs} = useSearchStateContext();
    const transactionIDs = transactionIDFromParams ? [transactionIDFromParams] : selectedTransactionIDs;
    const {clearSelectedTransactions} = useSearchActionsContext();
    const [allReports] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}`);
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const personalDetails = usePersonalDetails();
    const ownerPersonalDetails = useMemo(
        () => getPersonalDetailsForAccountID(selectedReport?.ownerAccountID, personalDetails) as PersonalDetails,
        [personalDetails, selectedReport?.ownerAccountID],
    );
    const selectedReportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport?.policyID}`];

    const hasPerDiemTransactions = useHasPerDiemTransactions(transactionIDs);

    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(hasPerDiemTransactions, undefined, undefined);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const policyForMovingExpenses = policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined;
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const selectReport = (item: TransactionGroupListItem, report?: OnyxEntry<Report>) => {
        if (transactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissToSuperWideRHP();
            return;
        }

        const newReport = report ?? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.value}`];
        const policyTagList = item?.policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${item.policyID}`] : {};

        setNavigationActionToMicrotaskQueue(() => {
            changeTransactionsReport({
                transactionIDs,
                isASAPSubmitBetaEnabled,
                accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                email: session?.email ?? '',
                newReport,
                policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
                reportNextStep,
                policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
                allTransactions,
                policyTagList,
            });
            turnOffMobileSelectionMode();
            clearSelectedTransactions(true);
        });

        Navigation.dismissToSuperWideRHP();
    };

    const removeFromReport = () => {
        if (!selectedReport || transactionIDs.length === 0) {
            return;
        }
        const policyTagList = personalPolicyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${personalPolicyID}`] : {};
        changeTransactionsReport({
            transactionIDs,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`],
            allTransactions,
            policyTagList,
        });
        if (shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }
        clearSelectedTransactions(true);
        Navigation.dismissToSuperWideRHP();
    };

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!hasPerDiemTransactions && !policyForMovingExpenses?.id) {
            return;
        }

        const policyForNewReport = hasPerDiemTransactions ? selectedReportPolicy : policyForMovingExpenses;
        const optimisticReport = createNewReport(ownerPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForNewReport, betas, false, shouldDismissEmptyReportsConfirmation);
        selectReport(
            {
                value: optimisticReport.reportID,
                keyForList: optimisticReport.reportID,
            },
            optimisticReport,
        );
    };

    const {handleCreateReport} = useConditionalCreateEmptyReportConfirmation({
        policyID: policyForMovingExpensesID,
        policyName: policyForMovingExpenses?.name ?? '',
        onCreateReport: createReportForPolicy,
        shouldBypassConfirmation: true,
    });

    const createReport = () => {
        const restrictionPolicyID = hasPerDiemTransactions ? selectedReport?.policyID : policyForMovingExpensesID;
        if (restrictionPolicyID && shouldRestrictUserBillableActions(restrictionPolicyID, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictionPolicyID));
            return;
        }
        if (hasPerDiemTransactions) {
            handleCreateReport();
            return;
        }
        if (!hasPerDiemTransactions && !policyForMovingExpensesID && !shouldSelectPolicy) {
            return;
        }
        if (shouldSelectPolicy) {
            Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true, backTo));
            return;
        }
        handleCreateReport();
    };

    return (
        <IOURequestEditReportCommon
            backTo={backTo}
            selectedReportID={reportID}
            transactionIDs={transactionIDs}
            selectReport={selectReport}
            removeFromReport={removeFromReport}
            isEditing={action === CONST.IOU.ACTION.EDIT}
            createReport={createReport}
            isPerDiemRequest={hasPerDiemTransactions}
        />
    );
}

export default withWritableReportOrNotFound(IOURequestEditReport);
