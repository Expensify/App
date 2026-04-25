import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {setTransactionReport} from '@libs/actions/Transaction';
import {READ_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import HttpUtils from '@libs/HttpUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {findSelfDMReportID, generateReportID, isInvoiceRoomWithID} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {isDistanceRequest} from '@libs/TransactionUtils';
import {
    resetDraftTransactionsCustomUnit,
    setCustomUnitRateID,
    setMoneyRequestCategory,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestTag,
} from '@userActions/IOU';
import {setSplitShares} from '@userActions/IOU/Split';
import {createDraftWorkspace, generateDefaultWorkspaceName} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {lastWorkspaceNumberSelector} from '@src/selectors/Policy';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import KeyboardUtils from '@src/utils/keyboard';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useMappedPolicies from './useMappedPolicies';
import useOnyx from './useOnyx';
import useOptimisticDraftTransactions from './useOptimisticDraftTransactions';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';
import useTransactionsByID from './useTransactionsByID';

const policyMapper = (policy: OnyxEntry<Policy>): OnyxEntry<Policy> =>
    policy && {
        id: policy.id,
        name: policy.name,
        type: policy.type,
        role: policy.role,
        owner: policy.owner,
        outputCurrency: policy.outputCurrency,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        customUnits: policy.customUnits,
    };

type UseParticipantSubmissionParams = {
    reportID: string;
    initialTransactionID: string;
    initialTransaction: OnyxEntry<Transaction>;
    participants: Participant[] | undefined;
    iouType: IOUType;
    action: IOUAction;
    backTo: string | undefined;
    isSplitRequest: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    isFocused: boolean;
};

function useParticipantSubmission({
    reportID,
    initialTransactionID,
    initialTransaction,
    participants,
    iouType,
    action,
    backTo,
    isSplitRequest,
    isMovingTransactionFromTrackExpense,
    isFocused,
}: UseParticipantSubmissionParams) {
    const {translate} = useLocalize();

    const [allPolicies] = useMappedPolicies(policyMapper);
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const selfDMReportID = findSelfDMReportID();
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const [draftTransactions] = useOptimisticDraftTransactions(initialTransaction);
    // React Compiler memoizes `transactionIDs` — it only gets a new reference when `draftTransactions`
    // changes (i.e. on actual Onyx writes to COLLECTION.TRANSACTION_DRAFT). The search hot-path updates
    // RAM_ONLY_IS_SEARCHING_FOR_REPORTS instead, so `transactionIDs` stays stable during search and no
    // explicit useMemo is needed here.
    const transactionIDs = draftTransactions?.map((transaction) => transaction.transactionID);
    const [transactions] = useTransactionsByID(transactionIDs);

    const isActivePolicyRequest =
        iouType === CONST.IOU.TYPE.CREATE &&
        isPaidGroupPolicy(activePolicy) &&
        activePolicy?.isPolicyExpenseChatEnabled &&
        !shouldRestrictUserBillableActions(activePolicy.id, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed);

    const dataRef = useRef({
        allPolicies,
        lastSelectedDistanceRates,
        selfDMReportID,
        selfDMReport,
        introSelected,
        currentUserPersonalDetails,
        policyForMovingExpenses,
        draftTransactions,
        isActivePolicyRequest,
        participants,
        initialTransaction,
        translate,
    });

    useEffect(() => {
        dataRef.current = {
            allPolicies,
            lastSelectedDistanceRates,
            selfDMReportID,
            selfDMReport,
            introSelected,
            currentUserPersonalDetails,
            policyForMovingExpenses,
            draftTransactions,
            isActivePolicyRequest,
            participants,
            initialTransaction,
            translate,
        };
    });

    // We need to set selectedReportID if user has navigated back from confirmation page and navigates to confirmation page with already selected participant
    const selectedReportID = useRef<string>(participants?.length === 1 ? (participants.at(0)?.reportID ?? reportID) : reportID);
    const numberOfParticipants = useRef(participants?.length ?? 0);

    // When the step opens, reset the draft transaction's custom unit if moved from Track Expense.
    // This resets the custom unit to the p2p rate when the destination workspace changes,
    // because we want to first check if the p2p rate exists on the workspace.
    // If it doesn't exist - we'll show an error message to force the user to choose a valid rate from the workspace.
    useEffect(() => {
        if (!isMovingTransactionFromTrackExpense || !isFocused || !transactions || transactions?.length === 0) {
            return;
        }

        for (const transaction of transactions) {
            resetDraftTransactionsCustomUnit(transaction);
        }
    }, [isFocused, isMovingTransactionFromTrackExpense, transactions]);

    useEffect(() => {
        const isCategorizing = action === CONST.IOU.ACTION.CATEGORIZE;
        const isShareAction = action === CONST.IOU.ACTION.SHARE;
        if (isFocused && (isCategorizing || isShareAction)) {
            for (const transaction of dataRef.current.draftTransactions) {
                setMoneyRequestParticipants(transaction.transactionID, []);
            }
            numberOfParticipants.current = 0;
        }
    }, [isFocused, action]);

    const trackExpense = () => {
        const {
            selfDMReportID: dmReportID,
            selfDMReport: dmReport,
            draftTransactions: drafts,
            policyForMovingExpenses: movingPolicy,
            currentUserPersonalDetails: userDetails,
            isActivePolicyRequest: isActiveRequest,
            lastSelectedDistanceRates: distanceRates,
        } = dataRef.current;

        // If coming from the combined submit/track flow and the user proceeds to just track the expense,
        // we will use the track IOU type in the confirmation flow.
        if (!dmReportID) {
            return;
        }

        for (const transaction of drafts) {
            const rateID = DistanceRequestUtils.getCustomUnitRateID({
                reportID: dmReportID,
                isTrackDistanceExpense: isDistanceRequest(transaction),
                policy: movingPolicy,
                isPolicyExpenseChat: false,
                lastSelectedDistanceRates: distanceRates,
            });
            setCustomUnitRateID(transaction.transactionID, rateID, transaction, movingPolicy);
            const shouldSetParticipantAutoAssignment = iouType === CONST.IOU.TYPE.CREATE;
            setMoneyRequestParticipantsFromReport(transaction.transactionID, dmReport, userDetails.accountID, shouldSetParticipantAutoAssignment ? isActiveRequest : false);
            setTransactionReport(transaction.transactionID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);
        }
        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, CONST.IOU.TYPE.TRACK, initialTransactionID, dmReportID);
        KeyboardUtils.dismissKeyboardAndExecute(() => {
            // If the backTo parameter is set, we should navigate back to the confirmation screen that is already on the stack.
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                if (backTo) {
                    // We don't want to compare params because we just changed the participants.
                    Navigation.goBack(iouConfirmationPageRoute, {compareParams: false});
                } else {
                    // We wrap navigation in setNavigationActionToMicrotaskQueue so that data loading in Onyx and navigation do not occur simultaneously, which resets the amount to 0.
                    // More information can be found here: https://github.com/Expensify/App/issues/73728
                    Navigation.navigate(iouConfirmationPageRoute);
                }
            });
        });
    };

    const addParticipant = (val: Participant[]) => {
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);

        const firstParticipant = val.at(0);

        if (firstParticipant?.isSelfDM && !isSplitRequest) {
            trackExpense();
            return;
        }

        const {allPolicies: policies, lastSelectedDistanceRates: distanceRates, draftTransactions: drafts} = dataRef.current;
        const firstParticipantReportID = val.at(0)?.reportID;
        const isPolicyExpenseChat = !!firstParticipant?.isPolicyExpenseChat;
        const policy = isPolicyExpenseChat && firstParticipant?.policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${firstParticipant.policyID}`] : undefined;
        const isInvoice = iouType === CONST.IOU.TYPE.INVOICE;
        numberOfParticipants.current = val.length;

        // Use transactions array if available, otherwise use initialTransactionID directly
        // This handles the case where initialTransaction hasn't loaded yet but we still need to set participants
        if (drafts.length > 0) {
            for (const transaction of drafts) {
                setMoneyRequestParticipants(transaction.transactionID, val);
            }
        } else {
            // Fallback to using initialTransactionID directly when transaction object isn't loaded yet
            setMoneyRequestParticipants(initialTransactionID, val);
        }

        if (!isMovingTransactionFromTrackExpense || !isPolicyExpenseChat) {
            // If not moving the transaction from track expense, select the default rate automatically.
            // Otherwise, keep the original p2p rate and let the user manually change it to the one they want from the workspace.
            const rateID = DistanceRequestUtils.getCustomUnitRateID({reportID: firstParticipantReportID, isPolicyExpenseChat, policy, lastSelectedDistanceRates: distanceRates});

            if (drafts.length > 0) {
                for (const transaction of drafts) {
                    setCustomUnitRateID(transaction.transactionID, rateID, transaction, policy);
                }
            } else {
                // Fallback to using initialTransactionID directly
                setCustomUnitRateID(initialTransactionID, rateID, undefined, policy);
            }
        }

        // When multiple valid participants are selected, the reportID is generated at the end of the confirmation step.
        // So we are resetting selectedReportID ref to the reportID coming from params.
        // For invoices, a valid participant must have a login.

        const hasOneValidParticipant = iouType === CONST.IOU.TYPE.INVOICE && selectedReportID.current !== reportID ? val.filter((item) => !!item.login).length !== 1 : val.length !== 1;

        if (hasOneValidParticipant && !isInvoice) {
            selectedReportID.current = reportID;
            return;
        }

        // When a participant is selected, the reportID needs to be saved because that's the reportID that will be used in the confirmation step.
        // We use || to be sure that if the first participant doesn't have a reportID, we generate a new one.
        if (isInvoice) {
            selectedReportID.current = firstParticipantReportID && isInvoiceRoomWithID(firstParticipantReportID) ? firstParticipantReportID : generateReportID();
        } else {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            selectedReportID.current = firstParticipantReportID || generateReportID();
        }
    };

    const goToNextStep = (_value?: string, nextParticipants?: Participant[]) => {
        const {
            allPolicies: policies,
            draftTransactions: drafts,
            currentUserPersonalDetails: userDetails,
            introSelected: intro,
            participants: currentParticipants,
            initialTransaction: splitTransaction,
            policyForMovingExpenses: movingPolicy,
        } = dataRef.current;

        const isCategorizing = action === CONST.IOU.ACTION.CATEGORIZE;
        const isShareAction = action === CONST.IOU.ACTION.SHARE;

        // Prefer nextParticipants (passed directly from the selector callback) over currentParticipants
        // (last-rendered value from dataRef) because the Onyx write from addParticipant may not have
        // caused a re-render yet by the time goToNextStep is called.
        const effectiveParticipants = nextParticipants ?? currentParticipants;
        const isPolicyExpenseChat = effectiveParticipants?.some((participant) => participant.isPolicyExpenseChat);
        if (iouType === CONST.IOU.TYPE.SPLIT && !isPolicyExpenseChat && splitTransaction?.amount && splitTransaction?.currency) {
            const participantAccountIDs = effectiveParticipants?.map((participant) => participant.accountID) as number[];
            setSplitShares(splitTransaction, splitTransaction.amount, splitTransaction.currency, participantAccountIDs);
        }

        const newReportID = selectedReportID.current;
        const currentSelfDMReportID = dataRef.current.selfDMReportID;
        const shouldUpdateTransactionReportID = effectiveParticipants?.at(0)?.reportID !== newReportID;
        const transactionReportID = newReportID === currentSelfDMReportID ? CONST.REPORT.UNREPORTED_REPORT_ID : newReportID;
        const firstParticipant = effectiveParticipants?.at(0);
        for (const transaction of drafts) {
            const tag = isMovingTransactionFromTrackExpense && transaction?.tag ? transaction?.tag : '';
            setMoneyRequestTag(transaction.transactionID, tag);
            const policy = isPolicyExpenseChat && firstParticipant?.policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${firstParticipant.policyID}`] : undefined;
            const policyDistance = Object.values(policy?.customUnits ?? {}).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
            const defaultCategory = isDistanceRequest(transaction) && policyDistance?.defaultCategory ? policyDistance?.defaultCategory : '';
            const category = isMovingTransactionFromTrackExpense ? (transaction?.category ?? '') : defaultCategory;
            setMoneyRequestCategory(transaction.transactionID, category, isMovingTransactionFromTrackExpense ? movingPolicy : undefined, isMovingTransactionFromTrackExpense);
            if (shouldUpdateTransactionReportID) {
                setTransactionReport(transaction.transactionID, {reportID: transactionReportID}, true);
            }
        }
        if ((isCategorizing || isShareAction) && numberOfParticipants.current === 0) {
            const email = userDetails.email ?? '';
            const lastWorkspaceNumber = lastWorkspaceNumberSelector(policies, email);
            const {expenseChatReportID, policyID, policyName} = createDraftWorkspace(
                intro,
                generateDefaultWorkspaceName(email, lastWorkspaceNumber, translate),
                userDetails.accountID,
                email,
            );
            for (const transaction of drafts) {
                setMoneyRequestParticipants(transaction.transactionID, [
                    {
                        selected: true,
                        accountID: 0,
                        isPolicyExpenseChat: true,
                        reportID: expenseChatReportID,
                        policyID,
                        searchText: policyName,
                    },
                ]);
            }
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                if (isCategorizing) {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST.IOU.TYPE.SUBMIT, initialTransactionID, expenseChatReportID));
                } else {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, CONST.IOU.TYPE.SUBMIT, initialTransactionID, expenseChatReportID, undefined, true));
                }
            });
            return;
        }

        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
            action,
            iouType === CONST.IOU.TYPE.CREATE || iouType === CONST.IOU.TYPE.TRACK ? CONST.IOU.TYPE.SUBMIT : iouType,
            initialTransactionID,
            newReportID,
            undefined,
            undefined,
            action === CONST.IOU.ACTION.SHARE ? Navigation.getActiveRoute() : undefined,
        );

        const route = isCategorizing
            ? ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, initialTransactionID, selectedReportID.current || reportID, iouConfirmationPageRoute)
            : iouConfirmationPageRoute;

        KeyboardUtils.dismissKeyboardAndExecute(() => {
            // If the backTo parameter is set, we should navigate back to the confirmation screen that is already on the stack.
            // We wrap navigation in setNavigationActionToMicrotaskQueue so that data loading in Onyx and navigation do not occur simultaneously, which resets the amount to 0.
            // More information can be found here: https://github.com/Expensify/App/issues/73728
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                if (backTo) {
                    // We don't want to compare params because we just changed the participants.
                    Navigation.goBack(route, {compareParams: false});
                } else {
                    Navigation.navigate(route);
                }
            });
        });
    };

    return {addParticipant, goToNextStep};
}

export default useParticipantSubmission;
