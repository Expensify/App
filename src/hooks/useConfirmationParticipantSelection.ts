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

    /** The workspace the expense is on before the selection, used to tell whether the selection switches workspaces */
    policyID: string | undefined;

    isDistanceRequest: boolean;

    blockDistanceRequestIfNeeded: ReturnType<typeof useBlockDistanceRequest>;

    /** Called when the selection moves the expense to another iouType, so the confirmation's route can follow */
    onIOUTypeChange: (iouType: IOUType) => void;
};

/**
 * What selecting a recipient from the confirmation's "To" row writes to the expense. Unlike the participants step of the
 * multi-step flow, it only touches the expense the confirmation shows and keeps the confirmation's route in place.
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
        // P2P chats don't support negative amounts. When a negative amount was entered before a participant
        // was selected (e.g. "Submit it to someone" from a self DM), assigning it to a P2P participant would
        // fail at submit, so keep the expense on the self DM (its default) instead of assigning the P2P
        // participant, stopping the user at selection rather than at submit. This only applies while the
        // expense is still on the self DM — a negative expense already bound to a policy expense chat (e.g.
        // global create auto-assigned the default workspace) must stay on that workspace rather than being
        // silently converted into a personal track expense.
        const isTransactionOnPolicyExpenseChat = transaction?.participants?.some((participant) => participant?.isPolicyExpenseChat);
        const shouldKeepOnSelfDM = !!selectedParticipant?.isSelfDM || ((transaction?.amount ?? 0) < 0 && !isTransactionOnPolicyExpenseChat && isParticipantP2P(selectedParticipant));
        if (shouldKeepOnSelfDM) {
            setMoneyRequestParticipantsFromReport(transactionID, selfDMReport, currentUserPersonalDetails.accountID);
            setTransactionReport(transactionID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);

            // The rate the expense picked up from a workspace does not exist outside it, so leaving it in place
            // makes the Rate field read "Pending..." and the amount go blank once the expense is back on the self
            // DM. Re-resolve the rate the self DM itself uses, the same way starting a track distance expense does.
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

                // A brand-new recipient picked by email has no chat yet (no reportID). Reusing the route's `reportID`
                // (which points at the flow's origin report - e.g. the default workspace chat this distance flow was
                // seeded with) leaves the expense bound to that workspace, so the backend rejects it with
                // "There is a previously existing chat between these users." Generate a fresh optimistic reportID for
                // P2P recipients, mirroring the legacy participants-step flow (useParticipantSubmission).
                const participantReportID = firstParticipant.reportID || (isPolicyExpenseChatParticipant ? reportID : generateReportID());
                setTransactionReport(transactionID, {reportID: participantReportID}, true);

                // When switching from the auto-assigned default workspace to a P2P recipient we must also undo the
                // workspace-specific defaults the distance step applied: reset the mileage rate to the P2P rate and
                // clear the workspace's default category (and the category-derived tax). Otherwise the confirmation
                // keeps the workspace "Default Rate"/category and the expense stays bound to that workspace. This
                // mirrors what the legacy addParticipant/goToNextStep path does when a P2P recipient is selected.
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

                    // Switching to a different workspace: the previous workspace's category and tag no longer apply,
                    // so reset them to the destination workspace's defaults. This mirrors the legacy participants-step
                    // flow (useParticipantSubmission.goToNextStep), which resets both on every selection and passes no
                    // policy so the previous workspace's category-derived tax is cleared along with the category.
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
