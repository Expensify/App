import {useFocusEffect} from '@react-navigation/native';
import {hasOnlyPersonalPoliciesSelector} from '@selectors/Policy';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {useMemo, useRef} from 'react';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {getIsFromGlobalCreate} from '@libs/TransactionUtils';
import {getMoneyRequestParticipantsFromReport, initMoneyRequest} from '@userActions/IOU/MoneyRequest';
import type {IOURequestType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOdometerDraftHydrator from './useOdometerDraftHydrator';
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

    /** Whether the new manual expense flow beta is enabled. When true, the fresh transaction is seeded with
     * participants from the current report so the embedded confirmation's auto-assign useEffect short-circuits. */
    isNewManualExpenseFlowEnabled?: boolean;
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
    isNewManualExpenseFlowEnabled = false,
}: UseResetIOUTypeParams): (newIOUType: IOURequestType) => void {
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [hasOnlyPersonalPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasOnlyPersonalPoliciesSelector});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const personalPolicy = usePersonalPolicy();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const hydrateOdometerOnLanding = useOdometerDraftHydrator({
        transaction,
        transactionRequestType,
        isLoadingTransaction,
        isLoadingSelectedTab,
    });

    // For the new manual flow, derive participants from the current report so the freshly-rebuilt transaction
    // already includes them. This prevents the embedded confirmation's auto-assign useEffect from re-firing on
    // every cleanup and dragging back unrelated draft state (receipt, billable, etc.) along with it.
    const defaultParticipants = useMemo(() => {
        if (!isNewManualExpenseFlowEnabled || !report) {
            return undefined;
        }
        const participants = getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID).filter((participant) => participant.selected);
        return participants.length > 0 ? participants : undefined;
    }, [isNewManualExpenseFlowEnabled, report, currentUserPersonalDetails.accountID]);

    const resetIOUTypeIfChanged = (newIOUType: IOURequestType) => {
        if (!(skipKeyboardDismissForPerDiem && newIOUType === CONST.IOU.REQUEST_TYPE.PER_DIEM)) {
            Keyboard.dismiss();
        }

        if (transaction?.iouRequestType === newIOUType) {
            return;
        }

        const isFromGlobalCreate = !report?.reportID;

        initMoneyRequest({
            reportID,
            policy,
            personalPolicy,
            isFromGlobalCreate,
            isTrackDistanceExpense,
            isFromFloatingActionButton: getIsFromGlobalCreate(transaction) ?? isFromGlobalCreate,
            currentIouRequestType: transaction?.iouRequestType,
            newIouRequestType: newIOUType,
            report,
            parentReport,
            currentDate,
            lastSelectedDistanceRates,
            currentUserPersonalDetails,
            hasOnlyPersonalPolicies: hasOnlyPersonalPolicies ?? true,
            draftTransactionIDs,
            defaultParticipants,
        });

        // Layer odometer draft fields onto the freshly-rebuilt transaction. The merge queues after
        // initMoneyRequest's Onyx.set, so the odometer fields land on top.
        hydrateOdometerOnLanding(newIOUType);
    };

    const tabSelectedTypeRef = useRef<IOURequestType | null>(null);

    const onTabSelected = (newIouType: IOURequestType) => {
        tabSelectedTypeRef.current = newIouType;
        resetIOUTypeIfChanged(newIouType);
    };

    const prevTransactionReportID = usePrevious(transaction?.reportID);
    const personalPolicyID = personalPolicy?.id;

    // Clear out the temporary expense if the reportID in the URL has changed from the transaction's reportID.
    useFocusEffect(() => {
        // Skip until transactionRequestType catches up with the tab onTabSelected already set.
        if (tabSelectedTypeRef.current && transactionRequestType !== tabSelectedTypeRef.current) {
            return;
        }
        tabSelectedTypeRef.current = null;

        // The test transaction can change the reportID of the transaction on the flow so we should prevent the reportID from being reverted again.
        if (
            transaction?.reportID === reportID ||
            isLoadingTransaction ||
            isLoadingSelectedTab ||
            !transactionRequestType ||
            prevTransactionReportID !== transaction?.reportID ||
            !personalPolicyID
        ) {
            return;
        }
        resetIOUTypeIfChanged(transactionRequestType);
    });

    return onTabSelected;
}

export default useResetIOUType;
