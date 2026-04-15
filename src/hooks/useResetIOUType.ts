import {useFocusEffect} from '@react-navigation/native';
import {policyTypeAndPendingActionSelector} from '@selectors/Policy';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {useCallback, useRef} from 'react';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil} from '@libs/PolicyUtils';
import type {IOURequestType} from '@userActions/IOU';
import {initMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePersonalPolicy from './usePersonalPolicy';
import usePrevious from './usePrevious';

type UseResetIOUTypeParams = {
    /** The report ID from the route params */
    reportID: string;

    /** The current report object */
    report: OnyxEntry<Report>;

    /** The current draft transaction */
    transaction: OnyxEntry<Transaction>;

    /** Whether the transaction data is still loading */
    isLoadingTransaction?: boolean;

    /** Whether the selected tab data is still loading */
    isLoadingSelectedTab?: boolean;

    /** The current transaction request type derived from tab/transaction state */
    transactionRequestType: IOURequestType | undefined;

    /** The policy resolved for this transaction */
    policy?: OnyxEntry<Policy>;

    /** Whether this is a track distance expense */
    isTrackDistanceExpense?: boolean;

    /** Whether to skip keyboard dismiss for per diem tab */
    skipKeyboardDismissForPerDiem?: boolean;
};

/**
 * Shared hook that encapsulates the tab-reset logic duplicated between
 * `IOURequestStartPage` and `DistanceRequestStartPage`.
 */
function useResetIOUType({
    reportID,
    report,
    transaction,
    isLoadingTransaction = false,
    isLoadingSelectedTab = false,
    transactionRequestType,
    policy,
    isTrackDistanceExpense = false,
    skipKeyboardDismissForPerDiem = false,
}: UseResetIOUTypeParams): (newIOUType: IOURequestType) => void {
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policyTypeAndPendingActionSelector});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const personalPolicy = usePersonalPolicy();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const dataRef = useRef({
        parentReport,
        allPolicies,
        lastSelectedDistanceRates,
        currentDate,
        draftTransactionIDs,
        personalPolicy,
        currentUserPersonalDetails,
        reportID,
        report,
        transaction,
        policy,
        isTrackDistanceExpense,
    });
    dataRef.current = {
        parentReport,
        allPolicies,
        lastSelectedDistanceRates,
        currentDate,
        draftTransactionIDs,
        personalPolicy,
        currentUserPersonalDetails,
        reportID,
        report,
        transaction,
        policy,
        isTrackDistanceExpense,
    };

    const resetIOUTypeIfChanged = useCallback(
        (newIOUType: IOURequestType) => {
            if (!(skipKeyboardDismissForPerDiem && newIOUType === CONST.IOU.REQUEST_TYPE.PER_DIEM)) {
                Keyboard.dismiss();
            }

            const d = dataRef.current;
            if (d.transaction?.iouRequestType === newIOUType) {
                return;
            }

            const isFromGlobalCreate = !d.report?.reportID;

            initMoneyRequest({
                reportID: d.reportID,
                policy: d.policy,
                personalPolicy: d.personalPolicy,
                isFromGlobalCreate: d.transaction?.isFromGlobalCreate ?? isFromGlobalCreate,
                isTrackDistanceExpense: d.isTrackDistanceExpense,
                isFromFloatingActionButton: d.transaction?.isFromFloatingActionButton ?? d.transaction?.isFromGlobalCreate ?? isFromGlobalCreate,
                currentIouRequestType: d.transaction?.iouRequestType,
                newIouRequestType: newIOUType,
                report: d.report,
                parentReport: d.parentReport,
                currentDate: d.currentDate,
                lastSelectedDistanceRates: d.lastSelectedDistanceRates,
                currentUserPersonalDetails: d.currentUserPersonalDetails,
                hasOnlyPersonalPolicies: hasOnlyPersonalPoliciesUtil(d.allPolicies),
                draftTransactionIDs: d.draftTransactionIDs,
            });
        },
        // Stable: reads everything from dataRef at call time
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [skipKeyboardDismissForPerDiem],
    );

    const prevTransactionReportID = usePrevious(transaction?.reportID);

    // Clear out the temporary expense if the reportID in the URL has changed from the transaction's reportID.
    useFocusEffect(
        useCallback(() => {
            // The test transaction can change the reportID of the transaction on the flow so we should prevent the reportID from being reverted again.
            if (
                transaction?.reportID === reportID ||
                isLoadingTransaction ||
                isLoadingSelectedTab ||
                !transactionRequestType ||
                prevTransactionReportID !== transaction?.reportID ||
                !dataRef.current.personalPolicy?.id
            ) {
                return;
            }
            resetIOUTypeIfChanged(transactionRequestType);
        }, [transaction?.reportID, reportID, resetIOUTypeIfChanged, transactionRequestType, isLoadingSelectedTab, prevTransactionReportID, isLoadingTransaction]),
    );

    return resetIOUTypeIfChanged;
}

export default useResetIOUType;
