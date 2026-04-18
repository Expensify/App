import {useFocusEffect} from '@react-navigation/native';
import {hasOnlyPersonalPoliciesSelector} from '@selectors/Policy';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {useRef} from 'react';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
    const [hasOnlyPersonalPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasOnlyPersonalPoliciesSelector});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const personalPolicy = usePersonalPolicy();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

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
            isFromFloatingActionButton: transaction?.isFromFloatingActionButton ?? transaction?.isFromGlobalCreate ?? isFromGlobalCreate,
            currentIouRequestType: transaction?.iouRequestType,
            newIouRequestType: newIOUType,
            report,
            parentReport,
            currentDate,
            lastSelectedDistanceRates,
            currentUserPersonalDetails,
            hasOnlyPersonalPolicies: hasOnlyPersonalPolicies ?? true,
            draftTransactionIDs,
        });
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
