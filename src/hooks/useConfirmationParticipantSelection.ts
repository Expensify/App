import {setTransactionReport} from '@libs/actions/Transaction';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {isParticipantP2P} from '@libs/IOUUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import {generateReportID, getReportOrDraftReport} from '@libs/ReportUtils';

import {setCustomUnitRateID, setMoneyRequestCategory, setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport, setMoneyRequestTag} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import type useBlockDistanceRequest from './useBlockDistanceRequest';

import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePersonalPolicy from './usePersonalPolicy';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';
import useSelfDMReport from './useSelfDMReport';

type UseConfirmationParticipantSelectionParams = {
    /** The expense the confirmation shows */
    transaction: OnyxEntry<Transaction>;

    /** The confirmation's iouType, before the picker maps SUBMIT and TRACK to CREATE */
    iouType: IOUType;

    /** The confirmation's route reportID */
    reportID: string;

    /** The expense's workspace before the selection, to tell whether the selection switches workspaces */
    policyID: string | undefined;

    isDistanceRequest: boolean;

    blockDistanceRequestIfNeeded: ReturnType<typeof useBlockDistanceRequest>;

    /** Called when the selection moves the expense to another iouType */
    onIOUTypeChange: (iouType: IOUType) => void;
};

/**
 * What picking a recipient from the confirmation's "To" row writes to the expense. Unlike the participants step, it
 * doesn't move the flow on.
 */
function useConfirmationParticipantSelection({
    transaction,
    iouType,
    reportID,
    policyID,
    isDistanceRequest,
    blockDistanceRequestIfNeeded,
    onIOUTypeChange,
}: UseConfirmationParticipantSelectionParams) {
    const {getCurrencyDecimals} = useCurrencyListActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalPolicy = usePersonalPolicy();
    const selfDMReport = useSelfDMReport();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const [reportDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT);

    /** Writes the selection to the expense. Returns whether the selection was taken, so the picker can close. */
    const handleParticipantsAdded = (participantsList: Participant[], selectedPolicy?: OnyxEntry<Policy>): boolean => {
        const transactionID = transaction?.transactionID;
        if (!transactionID) {
            return false;
        }
        const selectedParticipant = participantsList.at(0);
        const selectedPolicyID =
            selectedParticipant?.policyID ??
            (selectedParticipant?.reportID
                ? getReportOrDraftReport(selectedParticipant.reportID, undefined, undefined, reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${selectedParticipant.reportID}`] ?? {})
                      ?.policyID
                : undefined);
        if (blockDistanceRequestIfNeeded(selectedPolicyID)) {
            return false;
        }
        // P2P chats don't support negative amounts, so a negative expense picked for a P2P recipient stays on the
        // self DM instead of failing at submit. An expense already on a workspace chat keeps its workspace.
        const isTransactionOnPolicyExpenseChat = transaction?.participants?.some((participant) => participant?.isPolicyExpenseChat);
        const shouldKeepOnSelfDM = !!selectedParticipant?.isSelfDM || ((transaction?.amount ?? 0) < 0 && !isTransactionOnPolicyExpenseChat && isParticipantP2P(selectedParticipant));
        if (shouldKeepOnSelfDM) {
            setMoneyRequestParticipantsFromReport(transactionID, selfDMReport, currentUserPersonalDetails.accountID);
            setTransactionReport(transactionID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);

            // A workspace rate doesn't exist on the self DM and would leave the Rate field "Pending...", so use the
            // self DM's own rate.
            if (isDistanceRequest) {
                const selfDMRateID = DistanceRequestUtils.getCustomUnitRateID({
                    reportID: selfDMReport?.reportID,
                    isPolicyExpenseChat: false,
                    isTrackDistanceExpense: true,
                    policy: policyForMovingExpenses,
                    lastSelectedDistanceRates,
                    expenseDate: transaction?.created,
                });
                setCustomUnitRateID(transactionID, selfDMRateID, transaction, policyForMovingExpenses, false, policyForMovingExpenses?.outputCurrency ?? personalPolicy?.outputCurrency);
            }

            if (iouType !== CONST.IOU.TYPE.TRACK) {
                onIOUTypeChange(CONST.IOU.TYPE.TRACK);
            }
        } else {
            if (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK) {
                onIOUTypeChange(CONST.IOU.TYPE.CREATE);
            }
            setMoneyRequestParticipants(transactionID, participantsList);
            const firstParticipant = participantsList.at(0);
            if (iouType !== CONST.IOU.TYPE.SPLIT && firstParticipant) {
                const isPolicyExpenseChatParticipant = !!firstParticipant.isPolicyExpenseChat;

                // A new recipient picked by email has no chat yet. The route's reportID points at the flow's origin
                // report, which the backend rejects for them, so a new one is generated, like useParticipantSubmission does.
                const participantReportID = firstParticipant.reportID || (isPolicyExpenseChatParticipant ? reportID : generateReportID());
                setTransactionReport(transactionID, {reportID: participantReportID}, true);

                // A P2P recipient drops the workspace's rate, category and tag, like useParticipantSubmission does.
                if (!isPolicyExpenseChatParticipant) {
                    if (isDistanceRequest) {
                        const p2pRateID = DistanceRequestUtils.getCustomUnitRateID({
                            reportID: firstParticipant.reportID,
                            isPolicyExpenseChat: false,
                            policy: undefined,
                            lastSelectedDistanceRates,
                            expenseDate: transaction?.created,
                        });
                        setCustomUnitRateID(transactionID, p2pRateID, transaction, undefined, false, personalPolicy?.outputCurrency);
                    }
                    setMoneyRequestCategory(transactionID, '', undefined, getCurrencyDecimals);
                    setMoneyRequestTag(transactionID, '');
                } else {
                    const workspacePolicy = selectedPolicy;
                    if (isDistanceRequest) {
                        const currentRateID = transaction?.comment?.customUnit?.customUnitRateID;
                        const isCurrentRateFromWorkspace = !!currentRateID && !!DistanceRequestUtils.getMileageRates(workspacePolicy)[currentRateID];
                        if (!isCurrentRateFromWorkspace) {
                            const workspaceRateID = DistanceRequestUtils.getCustomUnitRateID({
                                reportID: participantReportID,
                                isPolicyExpenseChat: true,
                                policy: workspacePolicy,
                                lastSelectedDistanceRates,
                                expenseDate: transaction?.created,
                            });
                            setCustomUnitRateID(transactionID, workspaceRateID, transaction, workspacePolicy, false, workspacePolicy?.outputCurrency);
                        }
                    }

                    // The previous workspace's category and tag don't apply in the new one, so reset them. No policy is
                    // passed, so the category's tax is cleared too.
                    if (firstParticipant.policyID && firstParticipant.policyID !== policyID) {
                        const defaultCategory = isDistanceRequest ? (getDistanceRateCustomUnit(workspacePolicy)?.defaultCategory ?? '') : '';
                        setMoneyRequestCategory(transactionID, defaultCategory, undefined, getCurrencyDecimals);
                        setMoneyRequestTag(transactionID, '');
                    }
                }
            }
        }
        return participantsList.length > 0;
    };

    return {handleParticipantsAdded};
}

export default useConfirmationParticipantSelection;
