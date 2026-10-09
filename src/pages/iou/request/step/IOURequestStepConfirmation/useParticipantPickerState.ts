import type useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultParticipants from '@hooks/useDefaultParticipants';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useSelfDMReport from '@hooks/useSelfDMReport';

import {setTransactionReport} from '@libs/actions/Transaction';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {isParticipantP2P} from '@libs/IOUUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import {generateReportID, getReportOrDraftReport} from '@libs/ReportUtils';

import {setCustomUnitRateID, setMoneyRequestCategory, setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport, setMoneyRequestTag} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useEffect, useRef, useState} from 'react';

import type {IOURequestStepConfirmationProps} from './types';

type UseParticipantPickerStateParams = {
    transaction: OnyxEntry<Transaction>;
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    reportID: string;
    reportDrafts: OnyxCollection<Report>;
    navigation: IOURequestStepConfirmationProps['navigation'];
    policyID: string | undefined;
    isDistanceRequest: boolean;
    isManualRequest: boolean;
    blockDistanceRequestIfNeeded: ReturnType<typeof useBlockDistanceRequest>;
};

/**
 * Owns the confirmation's in-place "To" picker: the participants auto-assigned from the source report, when the
 * picker opens and closes, and what selecting a participant writes to the transaction.
 */
function useParticipantPickerState({
    transaction,
    iouType,
    reportID,
    reportDrafts,
    navigation,
    policyID,
    isDistanceRequest,
    isManualRequest,
    blockDistanceRequestIfNeeded,
}: UseParticipantPickerStateParams) {
    const {getCurrencyDecimals} = useCurrencyListActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalPolicy = usePersonalPolicy();
    const selfDMReport = useSelfDMReport();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);

    const sourceReportID = transaction?.reportID ?? reportID;
    const sourceReport = sourceReportID
        ? getReportOrDraftReport(sourceReportID, undefined, undefined, reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${sourceReportID}`] ?? {})
        : undefined;
    const {participants: resolvedDefaultParticipants, isLoading: isLoadingDefaultParticipants} = useDefaultParticipants({sourceReport, transaction, iouType});
    const hasSelectedParticipants = (transaction?.participants ?? []).some((participant) => participant?.selected);
    // Don't override the participants the user has already selected, and bail when there is no source report.
    const defaultParticipants = hasSelectedParticipants || !sourceReportID ? [] : resolvedDefaultParticipants;

    const transactionParticipants = transaction?.participants ?? [];
    const shouldAutoOpenParticipantPicker =
        !!transaction?.transactionID && transactionParticipants.length === 0 && defaultParticipants.length === 0 && !isLoadingDefaultParticipants && isManualRequest;
    const activeTransactionID = transaction?.transactionID;
    const [manuallyOpenedParticipantPickerForTransactionID, setManuallyOpenedParticipantPickerForTransactionID] = useState<string | undefined>();
    const [dismissedAutoOpenParticipantPickerForTransactionID, setDismissedAutoOpenParticipantPickerForTransactionID] = useState<string | undefined>();
    const participantPickerIOUType = iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK ? CONST.IOU.TYPE.CREATE : iouType;
    const isParticipantPickerVisible =
        !!activeTransactionID &&
        (manuallyOpenedParticipantPickerForTransactionID === activeTransactionID ||
            (shouldAutoOpenParticipantPicker && dismissedAutoOpenParticipantPickerForTransactionID !== activeTransactionID));

    const openParticipantPicker = () => {
        if (!activeTransactionID) {
            return;
        }
        setManuallyOpenedParticipantPickerForTransactionID(activeTransactionID);
    };

    const closeParticipantPicker = () => {
        setManuallyOpenedParticipantPickerForTransactionID(undefined);
        if (!activeTransactionID) {
            return;
        }
        setDismissedAutoOpenParticipantPickerForTransactionID(activeTransactionID);
    };

    const shouldReopenParticipantPickerOnFocusRef = useRef(false);

    // The referral banner inside the picker navigates to its own RHP, which the picker would otherwise cover, so the
    // picker closes first and is reopened when the user comes back. This goes through `closeParticipantPicker`, which
    // permanently marks the auto-open as dismissed, so the reopen below deliberately re-enters through the manual path.
    // That is what we want: after the round trip a genuine dismissal must close the picker for good.
    const closeParticipantPickerForReferralNavigation = () => {
        shouldReopenParticipantPickerOnFocusRef.current = isParticipantPickerVisible;
        closeParticipantPicker();
    };

    useEffect(
        () =>
            // This screen is also rendered embedded by `IOURequestStartPage`, so the listener fires on every refocus of
            // that screen, not only on back from the referral page. Re-checking that the expense still has no recipient
            // keeps an unrelated RHP round trip (or a recipient resolved meanwhile) from slamming the picker open over a
            // form the user wasn't editing.
            navigation.addListener('focus', () => {
                if (!shouldReopenParticipantPickerOnFocusRef.current) {
                    return;
                }
                shouldReopenParticipantPickerOnFocusRef.current = false;
                if (!activeTransactionID || hasSelectedParticipants) {
                    return;
                }
                setManuallyOpenedParticipantPickerForTransactionID(activeTransactionID);
            }),
        [navigation, activeTransactionID, hasSelectedParticipants],
    );

    const handleParticipantsAdded = (participantsList: Participant[], selectedPolicy?: OnyxEntry<Policy>) => {
        if (!activeTransactionID) {
            return;
        }
        const selectedParticipant = participantsList.at(0);
        const selectedPolicyID =
            selectedParticipant?.policyID ??
            (selectedParticipant?.reportID
                ? getReportOrDraftReport(selectedParticipant.reportID, undefined, undefined, reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${selectedParticipant.reportID}`] ?? {})
                      ?.policyID
                : undefined);
        if (blockDistanceRequestIfNeeded(selectedPolicyID)) {
            return;
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
            setMoneyRequestParticipantsFromReport(activeTransactionID, selfDMReport, currentUserPersonalDetails.accountID);
            setTransactionReport(activeTransactionID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);

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
                setCustomUnitRateID(
                    activeTransactionID,
                    selfDMRateID,
                    transaction,
                    policyForMovingExpenses,
                    false,
                    policyForMovingExpenses?.outputCurrency ?? personalPolicy?.outputCurrency,
                );
            }

            if (iouType !== CONST.IOU.TYPE.TRACK) {
                navigation.setParams({iouType: CONST.IOU.TYPE.TRACK});
            }
        } else {
            if (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK) {
                navigation.setParams({iouType: CONST.IOU.TYPE.CREATE});
            }
            setMoneyRequestParticipants(activeTransactionID, participantsList);
            const firstParticipant = participantsList.at(0);
            if (iouType !== CONST.IOU.TYPE.SPLIT && firstParticipant) {
                const isPolicyExpenseChatParticipant = !!firstParticipant.isPolicyExpenseChat;

                // A brand-new recipient picked by email has no chat yet (no reportID). Reusing the route's `reportID`
                // (which points at the flow's origin report - e.g. the default workspace chat this distance flow was
                // seeded with) leaves the expense bound to that workspace, so the backend rejects it with
                // "There is a previously existing chat between these users." Generate a fresh optimistic reportID for
                // P2P recipients, mirroring the legacy participants-step flow (useParticipantSubmission).
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                const participantReportID = firstParticipant.reportID || (isPolicyExpenseChatParticipant ? reportID : generateReportID());
                setTransactionReport(activeTransactionID, {reportID: participantReportID}, true);

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
                        setCustomUnitRateID(activeTransactionID, p2pRateID, transaction, undefined, false, personalPolicy?.outputCurrency);
                    }
                    setMoneyRequestCategory(activeTransactionID, '', undefined, getCurrencyDecimals);
                    setMoneyRequestTag(activeTransactionID, '');
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
                            setCustomUnitRateID(activeTransactionID, workspaceRateID, transaction, workspacePolicy, false, workspacePolicy?.outputCurrency);
                        }
                    }

                    // Switching to a different workspace: the previous workspace's category and tag no longer apply,
                    // so reset them to the destination workspace's defaults. This mirrors the legacy participants-step
                    // flow (useParticipantSubmission.goToNextStep), which resets both on every selection and passes no
                    // policy so the previous workspace's category-derived tax is cleared along with the category.
                    if (firstParticipant.policyID && firstParticipant.policyID !== policyID) {
                        const defaultCategory = isDistanceRequest ? (getDistanceRateCustomUnit(workspacePolicy)?.defaultCategory ?? '') : '';
                        setMoneyRequestCategory(activeTransactionID, defaultCategory, undefined, getCurrencyDecimals);
                        setMoneyRequestTag(activeTransactionID, '');
                    }
                }
            }
        }
        if (participantsList.length > 0) {
            closeParticipantPicker();
        }
    };

    useEffect(() => {
        if (!transaction?.transactionID) {
            return;
        }

        const hasTransactionParticipants = (transaction?.participants ?? []).length > 0;
        const hasDefaultParticipants = defaultParticipants.length > 0;

        if (hasTransactionParticipants || !hasDefaultParticipants) {
            return;
        }

        setMoneyRequestParticipants(transaction.transactionID, defaultParticipants);
        const firstDefault = defaultParticipants.at(0);
        if (firstDefault?.isSelfDM) {
            setTransactionReport(transaction.transactionID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);
            navigation.setParams({iouType: CONST.IOU.TYPE.TRACK});
        } else if (firstDefault?.reportID) {
            setTransactionReport(transaction.transactionID, {reportID: firstDefault.reportID}, true);
        }
    }, [transaction?.transactionID, transaction?.participants, defaultParticipants, isManualRequest, navigation]);

    return {
        defaultParticipants,
        isParticipantPickerVisible,
        participantPickerIOUType,
        openParticipantPicker,
        closeParticipantPicker,
        closeParticipantPickerForReferralNavigation,
        handleParticipantsAdded,
    };
}

export default useParticipantPickerState;
