import {useIsFocused} from '@react-navigation/core';
import {createPoliciesSelector} from '@selectors/Policy';
import {transactionDraftValuesSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import FormHelpMessage from '@components/FormHelpMessage';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useThemeStyles from '@hooks/useThemeStyles';
import {setTransactionReport} from '@libs/actions/Transaction';
import {READ_COMMANDS} from '@libs/API/types';
import {isMobileSafari as isMobileSafariBrowser} from '@libs/Browser';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getPlatform from '@libs/getPlatform';
import HttpUtils from '@libs/HttpUtils';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils, navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {findSelfDMReportID, generateReportID, isInvoiceRoomWithID} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import {getRequestType, hasRoute, isCorporateCardTransaction, isDistanceRequest, isPerDiemRequest} from '@libs/TransactionUtils';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import {
    navigateToStartStepIfScanFileCannotBeRead,
    resetDraftTransactionsCustomUnit,
    setCustomUnitRateID,
    setMoneyRequestCategory,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestTag,
    setSplitShares,
} from '@userActions/IOU';
import {createDraftWorkspace} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import KeyboardUtils from '@src/utils/keyboard';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const policySelector = (policy: OnyxEntry<Policy>): OnyxEntry<Policy> =>
    policy && {
        id: policy.id,
        name: policy.name,
        type: policy.type,
        role: policy.role,
        owner: policy.owner,
        outputCurrency: policy.outputCurrency,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        customUnits: policy.customUnits,
        autoReporting: policy.autoReporting,
    };

const policiesSelector = (policies: OnyxCollection<Policy>) => createPoliciesSelector(policies, policySelector);

type IOURequestStepParticipantsProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS>;

function IOURequestStepParticipants({
    route: {
        params: {iouType, reportID, transactionID: initialTransactionID, action, backTo},
    },
    transaction: initialTransaction,
}: IOURequestStepParticipantsProps) {
    const participants = initialTransaction?.participants;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`, {canBeMissing: true});
    const [optimisticTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: transactionDraftValuesSelector,
        canBeMissing: true,
    });
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: true});

    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const transactions = useMemo(() => {
        const allTransactions = optimisticTransactions && optimisticTransactions.length > 1 ? optimisticTransactions : [initialTransaction];
        return allTransactions.filter((transaction): transaction is Transaction => !!transaction);
    }, [initialTransaction, optimisticTransactions]);
    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const transactionIDs = useMemo(() => transactions?.map((transaction) => transaction.transactionID), [transactions.length]);

    // We need to set selectedReportID if user has navigated back from confirmation page and navigates to confirmation page with already selected participant
    const selectedReportID = useRef<string>(participants?.length === 1 ? (participants.at(0)?.reportID ?? reportID) : reportID);
    // We can assume that shouldAutoReport is true as the initial value is not used. shouldAutoReport is only used after the selectedReportID changes in addParticipant where we'd update shouldAutoReport too
    const shouldAutoReport = useRef(true);
    const numberOfParticipants = useRef(participants?.length ?? 0);
    const iouRequestType = getRequestType(initialTransaction);
    const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const headerTitle = useMemo(() => {
        if (action === CONST.IOU.ACTION.CATEGORIZE) {
            return translate('iou.categorize');
        }
        if (action === CONST.IOU.ACTION.SHARE) {
            return translate('iou.share');
        }
        if (isSplitRequest) {
            return translate('iou.splitExpense');
        }
        if (iouType === CONST.IOU.TYPE.PAY) {
            return translate('iou.paySomeone', {});
        }
        if (iouType === CONST.IOU.TYPE.INVOICE) {
            return translate('workspace.invoices.sendInvoice');
        }
        return translate('iou.chooseRecipient');
    }, [iouType, translate, isSplitRequest, action]);

    const selfDMReportID = useMemo(() => findSelfDMReportID(), []);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const personalPolicy = useMemo(() => Object.values(allPolicies ?? {}).find((policy) => policy?.type === CONST.POLICY.TYPE.PERSONAL), [allPolicies]);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isActivePolicyRequest =
        iouType === CONST.IOU.TYPE.CREATE && isPaidGroupPolicy(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && !shouldRestrictUserBillableActions(activePolicy.id);

    const isAndroidNative = getPlatform() === CONST.PLATFORM.ANDROID;
    const isMobileSafari = isMobileSafariBrowser();
    const isPerDiem = isPerDiemRequest(initialTransaction);
    const isCorporateCard = isCorporateCardTransaction(initialTransaction);

    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        Performance.markEnd(CONST.TIMING.OPEN_CREATE_EXPENSE_CONTACT);
    }, []);

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the expense is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the expense process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    useEffect(() => {
        if (isMovingTransactionFromTrackExpense) {
            return;
        }
        const firstReceiptFilename = initialTransaction?.receipt?.filename ?? '';
        const firstReceiptPath = initialTransaction?.receipt?.source ?? '';
        const firstReceiptType = initialTransaction?.receipt?.type ?? '';
        navigateToStartStepIfScanFileCannotBeRead(firstReceiptFilename, firstReceiptPath, () => {}, iouRequestType, iouType, initialTransactionID, reportID, firstReceiptType);
    }, [
        iouRequestType,
        iouType,
        initialTransaction?.receipt?.filename,
        initialTransaction?.receipt?.source,
        initialTransaction?.receipt?.type,
        initialTransactionID,
        reportID,
        isMovingTransactionFromTrackExpense,
    ]);

    // When the step opens, reset the draft transaction's custom unit if moved from Track Expense.
    // This resets the custom unit to the p2p rate when the destination workspace changes,
    // because we want to first check if the p2p rate exists on the workspace.
    // If it doesn't exist - we'll show an error message to force the user to choose a valid rate from the workspace.
    useEffect(() => {
        if (!isMovingTransactionFromTrackExpense) {
            return;
        }

        for (const transactionID of transactionIDs) {
            resetDraftTransactionsCustomUnit(transactionID);
        }
    }, [isFocused, isMovingTransactionFromTrackExpense, transactionIDs]);

    const waitForKeyboardDismiss = useCallback(
        (callback: () => void) => {
            if (isAndroidNative || isMobileSafari) {
                KeyboardUtils.dismiss().then(() => {
                    callback();
                });
            } else {
                callback();
            }
        },
        [isAndroidNative, isMobileSafari],
    );

    const trackExpense = useCallback(() => {
        // If coming from the combined submit/track flow and the user proceeds to just track the expense,
        // we will use the track IOU type in the confirmation flow.
        if (!selfDMReportID) {
            return;
        }

        const rateID = CONST.CUSTOM_UNITS.FAKE_P2P_ID;
        for (const transaction of transactions) {
            setCustomUnitRateID(transaction.transactionID, rateID);
            const shouldSetParticipantAutoAssignment = iouType === CONST.IOU.TYPE.CREATE;
            setMoneyRequestParticipantsFromReport(
                transaction.transactionID,
                selfDMReport,
                currentUserPersonalDetails.accountID,
                shouldSetParticipantAutoAssignment ? isActivePolicyRequest : false,
            );
            setTransactionReport(transaction.transactionID, {reportID: selfDMReportID}, true);
        }
        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, CONST.IOU.TYPE.TRACK, initialTransactionID, selfDMReportID);
        waitForKeyboardDismiss(() => {
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
    }, [selfDMReportID, transactions, action, initialTransactionID, waitForKeyboardDismiss, iouType, selfDMReport, currentUserPersonalDetails.accountID, isActivePolicyRequest, backTo]);

    const addParticipant = useCallback(
        (val: Participant[]) => {
            HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);

            const firstParticipant = val.at(0);

            if (firstParticipant?.isSelfDM && !isSplitRequest) {
                trackExpense();
                return;
            }

            const firstParticipantReportID = val.at(0)?.reportID;
            const isPolicyExpenseChat = !!firstParticipant?.isPolicyExpenseChat;
            const policy = isPolicyExpenseChat && firstParticipant?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${firstParticipant.policyID}`] : undefined;
            const isInvoice = iouType === CONST.IOU.TYPE.INVOICE;
            numberOfParticipants.current = val.length;

            // Use transactions array if available, otherwise use initialTransactionID directly
            // This handles the case where initialTransaction hasn't loaded yet but we still need to set participants
            if (transactions.length > 0) {
                for (const transaction of transactions) {
                    setMoneyRequestParticipants(transaction.transactionID, val);
                }
            } else {
                // Fallback to using initialTransactionID directly when transaction object isn't loaded yet
                setMoneyRequestParticipants(initialTransactionID, val);
            }

            if (!isMovingTransactionFromTrackExpense) {
                // If not moving the transaction from track expense, select the default rate automatically.
                // Otherwise, keep the original p2p rate and let the user manually change it to the one they want from the workspace.
                const rateID = DistanceRequestUtils.getCustomUnitRateID({reportID: firstParticipantReportID, isPolicyExpenseChat, policy, lastSelectedDistanceRates});

                if (transactions.length > 0) {
                    for (const transaction of transactions) {
                        setCustomUnitRateID(transaction.transactionID, rateID);
                    }
                } else {
                    // Fallback to using initialTransactionID directly
                    setCustomUnitRateID(initialTransactionID, rateID);
                }
            }

            // When multiple valid participants are selected, the reportID is generated at the end of the confirmation step.
            // So we are resetting selectedReportID ref to the reportID coming from params.
            // For invoices, a valid participant must have a login.

            const hasOneValidParticipant = iouType === CONST.IOU.TYPE.INVOICE && selectedReportID.current !== reportID ? val.filter((item) => !!item.login).length !== 1 : val.length !== 1;

            if (hasOneValidParticipant && !isInvoice) {
                selectedReportID.current = reportID;
                shouldAutoReport.current = true;
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

            // IOUs are always reported. non-CREATE actions require a report
            if (!isPolicyExpenseChat || action !== CONST.IOU.ACTION.CREATE) {
                shouldAutoReport.current = true;
            } else {
                shouldAutoReport.current = !!policy?.autoReporting || !!personalPolicy?.autoReporting;
            }
        },
        [
            isSplitRequest,
            allPolicies,
            iouType,
            transactions,
            isMovingTransactionFromTrackExpense,
            reportID,
            action,
            trackExpense,
            initialTransactionID,
            lastSelectedDistanceRates,
            personalPolicy?.autoReporting,
        ],
    );

    const goToNextStep = useCallback(
        (_value?: string, _participants?: Participant[]) => {
            const isCategorizing = action === CONST.IOU.ACTION.CATEGORIZE;
            const isShareAction = action === CONST.IOU.ACTION.SHARE;

            const isPolicyExpenseChat = participants?.some((participant) => participant.isPolicyExpenseChat);
            if (iouType === CONST.IOU.TYPE.SPLIT && !isPolicyExpenseChat && initialTransaction?.amount && initialTransaction?.currency) {
                const participantAccountIDs = participants?.map((participant) => participant.accountID) as number[];
                setSplitShares(initialTransaction, initialTransaction.amount, initialTransaction.currency, participantAccountIDs);
            }

            const newReportID = selectedReportID.current;
            const shouldUpdateTransactionReportID = participants?.at(0)?.reportID !== newReportID;
            const transactionReportID = shouldAutoReport.current ? newReportID : CONST.REPORT.UNREPORTED_REPORT_ID;
            // TODO: probably should also change participants here for selectedParticipants.current, but out of scope of this PR
            for (const transaction of transactions) {
                const tag = isMovingTransactionFromTrackExpense && transaction?.tag ? transaction?.tag : '';
                setMoneyRequestTag(transaction.transactionID, tag);
                const firstParticipant = _participants?.at(0);
                const policy = isPolicyExpenseChat && firstParticipant?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${firstParticipant.policyID}`] : undefined;
                const policyDistance = Object.values(policy?.customUnits ?? {}).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
                const defaultCategory = isDistanceRequest(transaction) && policyDistance?.defaultCategory ? policyDistance?.defaultCategory : '';
                const category = isMovingTransactionFromTrackExpense ? (transaction?.category ?? '') : defaultCategory;
                setMoneyRequestCategory(transaction.transactionID, category, isMovingTransactionFromTrackExpense ? policyForMovingExpenses : undefined, isMovingTransactionFromTrackExpense);
                if (shouldUpdateTransactionReportID) {
                    setTransactionReport(transaction.transactionID, {reportID: transactionReportID}, true);
                }
            }
            if ((isCategorizing || isShareAction) && numberOfParticipants.current === 0) {
                const {expenseChatReportID, policyID, policyName} = createDraftWorkspace(introSelected);
                for (const transaction of transactions) {
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

            Performance.markStart(CONST.TIMING.OPEN_CREATE_EXPENSE_APPROVE);
            waitForKeyboardDismiss(() => {
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
        },
        [
            action,
            participants,
            iouType,
            initialTransaction,
            initialTransactionID,
            reportID,
            waitForKeyboardDismiss,
            transactions,
            isMovingTransactionFromTrackExpense,
            allPolicies,
            policyForMovingExpenses,
            introSelected,
            backTo,
        ],
    );

    const navigateBack = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // Change iouType param to enable negative values
        const shouldForceIOUType =
            action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.SUBMIT && (iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL || iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN);
        const iouTypeValue = shouldForceIOUType ? CONST.IOU.TYPE.CREATE : iouType;

        navigateToStartMoneyRequestStep(iouRequestType, iouTypeValue, initialTransactionID, reportID, action);
    }, [backTo, iouRequestType, iouType, initialTransactionID, reportID, action]);

    useEffect(() => {
        const isCategorizing = action === CONST.IOU.ACTION.CATEGORIZE;
        const isShareAction = action === CONST.IOU.ACTION.SHARE;
        if (isFocused && (isCategorizing || isShareAction)) {
            for (const transaction of transactions) {
                setMoneyRequestParticipants(transaction.transactionID, []);
            }
            numberOfParticipants.current = 0;
        }
        // We don't want to clear out participants every time the transactions change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, action]);

    const isWorkspacesOnly = useMemo(() => {
        if (isDistanceRequest(initialTransaction)) {
            // For distance requests, only restrict to workspaces if a route exists and the distance is 0
            // If no route exists yet, the distance hasn't been calculated and we should allow P2P
            if (!hasRoute(initialTransaction, true)) {
                return false;
            }
            return initialTransaction?.comment?.customUnit?.quantity === 0;
        }

        if (iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN) {
            return false;
        }

        return initialTransaction?.amount !== undefined && initialTransaction?.amount !== null && initialTransaction?.amount <= 0;
    }, [initialTransaction, iouRequestType]);

    return (
        <StepScreenWrapper
            headerTitle={headerTitle}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepParticipants"
        >
            {!!skipConfirmation && (
                <FormHelpMessage
                    style={[styles.ph4, styles.mb4]}
                    isError={false}
                    shouldShowRedDotIndicator={false}
                    message={translate('quickAction.noLongerHaveReportAccess')}
                />
            )}
            <MoneyRequestParticipantsSelector
                participants={isSplitRequest ? participants : getEmptyArray()}
                onParticipantsAdded={addParticipant}
                onFinish={goToNextStep}
                iouType={iouType}
                action={action}
                isPerDiemRequest={isPerDiem}
                isWorkspacesOnly={isWorkspacesOnly}
                isCorporateCardTransaction={isCorporateCard}
            />
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepParticipants));
