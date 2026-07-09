import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';

import type {WriteOverrides} from './Navigation/helpers/submitWithDismissFirst';
import type {YourSpendPatchData} from './YourSpendPatchData';

import {
    getMoneyRequestParticipantsFromReport,
    setMoneyRequestAmount,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
} from './actions/IOU/MoneyRequest';
import {sendMoneyElsewhere, sendMoneyWithWallet} from './actions/IOU/SendMoney';
import {resetSplitShares, setDraftSplitTransaction, setSplitShares} from './actions/IOU/Split';
import {requestMoney, trackExpense} from './actions/IOU/TrackExpense';
import {updateMoneyRequestAmountAndCurrency} from './actions/IOU/UpdateMoneyRequest';
import {setTransactionReport} from './actions/Transaction';
import {convertToBackendAmount} from './CurrencyUtils';
import {
    calculateDefaultReimbursable,
    getExistingTransactionID,
    isMovingTransactionFromTrackExpense,
    isParticipantP2P,
    navigateToConfirmationPage,
    navigateToParticipantPage,
    resolveOptimisticChatReportID,
} from './IOUUtils';
import cleanupAfterSkipConfirmSubmit from './Navigation/helpers/cleanupAfterSkipConfirmSubmit';
import {submitWithDismissFirst} from './Navigation/helpers/submitWithDismissFirst';
import Navigation from './Navigation/Navigation';
import {rand64} from './NumberUtils';
import {getParticipantsOption, getReportOption} from './OptionsListUtils';
import Permissions from './Permissions';
import {getPolicyExpenseChat, getTransactionDetails, isMoneyRequestReport, isSelfDM, shouldEnableNegative} from './ReportUtils';
import shouldUseDefaultExpensePolicy from './shouldUseDefaultExpensePolicy';
import {calculateTaxAmount, getAmount, getCurrency, getDefaultTaxCode, getIsFromGlobalCreate, getTaxValue, hasReceipt} from './TransactionUtils';

type SubmitAmountArgs = {
    report: OnyxEntry<OnyxTypes.Report>;
    translate: LocalizedTranslate;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    splitDraftTransaction: OnyxEntry<OnyxTypes.Transaction>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
    isDraftChatReport: boolean | undefined;
    selectedCurrency: string;
    decimals: number;
    iouType: IOUType;
    transactionID: string;
    reportID: string;
    action: IOUAction;
    backTo: Route | undefined;
    backToReport: string | undefined;
    shouldKeepUserInput: boolean;
    shouldSkipConfirmation: boolean;
    isReportArchived: boolean;
    currentUserPersonalDetails: OnyxTypes.PersonalDetails;
    delegateAccountID: number | undefined;
    selfDMReport: OnyxEntry<OnyxTypes.Report>;
    defaultExpensePolicy: OnyxEntry<OnyxTypes.Policy>;
    personalPolicy: OnyxEntry<Pick<OnyxTypes.Policy, 'id' | 'type' | 'autoReporting' | 'outputCurrency'>>;
    navigateBack: () => void;
    amount: string;
    paymentMethod?: PaymentMethodType;

    // Submit-time Onyx data — supplied by the screen via AmountSubmitDataSync so this module owns no subscriptions.
    allPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    allReports: OnyxCollection<OnyxTypes.Report>;
    allReportDrafts: OnyxCollection<OnyxTypes.Report>;
    allReportNVPs: OnyxCollection<OnyxTypes.ReportNameValuePairs>;
    transactionDrafts: OnyxCollection<OnyxTypes.Transaction>;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
    storedTransaction: OnyxEntry<OnyxTypes.Transaction>;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    duplicateTransactions: OnyxCollection<OnyxTypes.Transaction>;
    duplicateTransactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
    reportAttributesDerivedValue: OnyxEntry<ReportAttributesDerivedValue>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    betaConfiguration: OnyxEntry<OnyxTypes.BetaConfiguration>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    onboarding: OnyxEntry<OnyxTypes.Onboarding>;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    policyRecentlyUsedCurrencies: OnyxEntry<string[]>;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
    conciergeReportID: OnyxEntry<string>;
    yourSpendPatchData?: YourSpendPatchData;
};

/**
 * Look up a report by ID across the supplied `COLLECTION.REPORT` and `COLLECTION.REPORT_DRAFT`
 * collections. Returns the report-draft entry when no concrete report exists for the ID.
 */
function getReportOrReportDraftForAmount(
    reportID: string | undefined,
    allReports: OnyxCollection<OnyxTypes.Report>,
    allReportDrafts: OnyxCollection<OnyxTypes.Report>,
): OnyxEntry<OnyxTypes.Report> {
    if (!reportID) {
        return undefined;
    }
    return allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? allReportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`];
}

type GetIsP2PForAmountArgs = {
    chatReportForP2P: OnyxEntry<OnyxTypes.Report>;
    currentUserAccountID: number | undefined;
};

/**
 * Determines whether the first participant of `chatReportForP2P` is a P2P participant.
 * The caller is responsible for resolving the correct chat report (e.g. via reactive
 * `useReportOrReportDraft` hooks for editing flows where the transaction thread must be
 * traversed to the actual chat report).
 */
function getIsP2PForAmount({chatReportForP2P, currentUserAccountID}: GetIsP2PForAmountArgs): boolean {
    const firstParticipant = getMoneyRequestParticipantsFromReport(chatReportForP2P, currentUserAccountID).at(0);
    return isParticipantP2P(firstParticipant);
}

/**
 * Submission orchestration for `IOURequestStepAmount`. Verbatim port of the previous inline
 * `saveAmountAndCurrency` + `navigateToNextPage` handlers. All submit-only Onyx values are
 * passed in via the args object — the screen sources them from `AmountSubmitDataSync`.
 *
 * Branches:
 * - Non-edit path → delegate to nested `navigateToNextPage` (skip-confirm PAY / SEND / TRACK /
 *   REQUEST / SUBMIT / SPLIT, or routing to confirmation / participant / default-workspace).
 * - Edit path → fast-exit if amount/currency unchanged; otherwise `setDraftSplitTransaction`
 *   for split bills, else `updateMoneyRequestAmountAndCurrency` with duplicate-tx propagation.
 */
function submitAmount({
    report,
    transaction,
    splitDraftTransaction,
    policy,
    policyTags,
    isDraftChatReport,
    selectedCurrency,
    decimals,
    iouType,
    transactionID,
    reportID,
    action,
    backTo,
    backToReport,
    shouldKeepUserInput,
    shouldSkipConfirmation,
    isReportArchived,
    currentUserPersonalDetails,
    delegateAccountID,
    selfDMReport,
    defaultExpensePolicy,
    personalPolicy,
    navigateBack,
    amount,
    paymentMethod,
    allPersonalDetails,
    allReports,
    allReportDrafts,
    allReportNVPs,
    transactionDrafts,
    transactionViolations,
    storedTransaction,
    parentReportNextStep,
    policyCategories,
    userBillingGracePeriodEnds,
    duplicateTransactions,
    duplicateTransactionViolations,
    translate,
    reportAttributesDerivedValue,
    betas,
    betaConfiguration,
    quickAction,
    onboarding,
    introSelected,
    recentWaypoints,
    policyRecentlyUsedCurrencies,
    amountOwed,
    ownerBillingGracePeriodEnd,
    conciergeReportID,
    yourSpendPatchData,
}: SubmitAmountArgs): void {
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreateAction = action === CONST.IOU.ACTION.CREATE;
    const isSubmitAction = action === CONST.IOU.ACTION.SUBMIT;
    const isSubmitType = iouType === CONST.IOU.TYPE.SUBMIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isEditingSplitBill = isEditing && isSplitBill;
    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const allowNegative = shouldEnableNegative(report, policy, iouType, transaction?.participants);
    const disableOppositeConversion = isCreateAction || (isSubmitType && isSubmitAction);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const existingTransactionID = getExistingTransactionID(transaction?.linkedTrackedExpenseReportAction);
    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, betas, betaConfiguration);

    const navigateToNextPage = () => {
        const amountInSmallestCurrencyUnits = convertToBackendAmount(Number.parseFloat(amount));

        setMoneyRequestAmount(transactionID, amountInSmallestCurrencyUnits, selectedCurrency || CONST.CURRENCY.USD, shouldKeepUserInput, hasReceipt(transaction));

        if (isMovingTransactionFromTrackExpense(action)) {
            const taxCode = selectedCurrency !== policy?.outputCurrency ? policy?.taxRates?.foreignTaxDefault : policy?.taxRates?.defaultExternalID;
            if (taxCode) {
                setMoneyRequestTaxRate(transactionID, taxCode);
                const taxPercentage = getTaxValue(policy, transaction, taxCode) ?? '';
                const taxAmount = convertToBackendAmount(calculateTaxAmount(taxPercentage, amountInSmallestCurrencyUnits, decimals));
                setMoneyRequestTaxAmount(transactionID, taxAmount);
            }
        }

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because either:
        // - The user started this flow from using the + button in the composer inside a report.
        // - The user started this flow from using the global create menu by selecting the Track expense option.
        // In this case, the participants can be automatically assigned from the report and the user can skip
        // the participants step and go straight to the confirm step.
        // If the user is started this flow using the Create expense option (combined submit/track flow), they
        // should be redirected to the participants page.
        if (report?.reportID && !isReportArchived && iouType !== CONST.IOU.TYPE.CREATE) {
            const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID);
            const reportAttributesReports = reportAttributesDerivedValue?.reports;
            const reportIDToCheck = isMoneyRequestReport(report) ? report?.chatReportID : report?.reportID;
            const reportDraft = allReportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportIDToCheck}`];
            const participants = selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                const privateIsArchived = !!allReportNVPs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`]?.private_isArchived;
                return participantAccountID
                    ? getParticipantsOption(participant, allPersonalDetails, translate)
                    : getReportOption(participant, privateIsArchived, policy, allPersonalDetails, conciergeReportID, reportAttributesReports, reportDraft);
            });
            const backendAmount = convertToBackendAmount(Number.parseFloat(amount));
            const participant = participants.at(0);

            if (shouldSkipConfirmation) {
                const defaultReimbursable = calculateDefaultReimbursable({
                    iouType,
                    policy,
                    policyForMovingExpenses: policy,
                    participant,
                    transactionReportID: report?.reportID,
                });
                if (iouType === CONST.IOU.TYPE.PAY || iouType === CONST.IOU.TYPE.SEND) {
                    const {optimisticChatReportID, chatReportID} = resolveOptimisticChatReportID(
                        [participants.at(0)?.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserAccountIDParam],
                        report,
                    );
                    const sendMoneyParams = {
                        report,
                        quickAction,
                        amount: backendAmount,
                        currency: selectedCurrency,
                        comment: '',
                        currentUserAccountID: currentUserAccountIDParam,
                        recipient: participants.at(0) ?? {},
                        optimisticChatReportID,
                        shouldStartTracking: false,
                    };

                    const executeSendMoneyWrite = (overrides?: {shouldDeferForSearch?: boolean}) => {
                        const mergedParams = {...sendMoneyParams, ...overrides};
                        if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                            sendMoneyWithWallet(mergedParams);
                        } else {
                            sendMoneyElsewhere(mergedParams);
                        }
                    };

                    submitWithDismissFirst({
                        executeWrite: () => executeSendMoneyWrite({shouldDeferForSearch: false}),
                        destinationReportID: chatReportID,
                        telemetryContext: {
                            scenario: CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.SEND_MONEY,
                            iouType: CONST.IOU.TYPE.PAY,
                            requestType: CONST.IOU.TYPE.PAY,
                            isFromGlobalCreate: isEmptyObject(report) || !report?.reportID,
                            hasReceipt: false,
                        },
                    });
                    return;
                }
                const optimisticTransactionID = rand64();
                const {optimisticChatReportID} = resolveOptimisticChatReportID([participants.at(0)?.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserAccountIDParam], report);
                if (iouType !== CONST.IOU.TYPE.SUBMIT && iouType !== CONST.IOU.TYPE.REQUEST && iouType !== CONST.IOU.TYPE.TRACK) {
                    return;
                }
                const isTrackExpenseSubmit = iouType === CONST.IOU.TYPE.TRACK;
                const draftTransactionIDsList = Object.keys(transactionDrafts ?? {});
                const isSelfTourViewed = hasSeenTourSelector(onboarding) ?? false;
                const executeExpenseWrite = (overrides: WriteOverrides) => {
                    if (isTrackExpenseSubmit) {
                        trackExpense({
                            report,
                            isDraftPolicy: false,
                            isDraftChatReport: !!isDraftChatReport,
                            participantParams: {
                                payeeEmail: currentUserEmailParam,
                                payeeAccountID: currentUserAccountIDParam,
                                participant: participant ?? {},
                            },
                            transactionParams: {
                                amount: backendAmount,
                                currency: selectedCurrency ?? CONST.CURRENCY.USD,
                                created: transaction?.created,
                                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                                reimbursable: defaultReimbursable,
                                isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                            },
                            isASAPSubmitBetaEnabled,
                            currentUser: {accountID: currentUserAccountIDParam, email: currentUserEmailParam},
                            currentUserLocalCurrency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                            introSelected,
                            quickAction,
                            recentWaypoints,
                            betas,
                            draftTransactionIDs: draftTransactionIDsList,
                            isSelfTourViewed,
                            optimisticChatReportID,
                            optimisticTransactionID,
                            reportActionsList: undefined,
                        });
                    } else {
                        const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;
                        requestMoney({
                            report,
                            betas,
                            participantParams: {
                                participant: participant ?? {},
                                payeeEmail: currentUserEmailParam,
                                payeeAccountID: currentUserAccountIDParam,
                            },
                            transactionParams: {
                                amount: backendAmount,
                                currency: selectedCurrency,
                                created: transaction?.created ?? '',
                                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                                attendees: transaction?.comment?.attendees,
                                reimbursable: defaultReimbursable,
                                isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                            },
                            policyParams: {policyTagList: policyTags},
                            shouldGenerateTransactionThreadReport: false,
                            isASAPSubmitBetaEnabled,
                            currentUserAccountIDParam,
                            currentUserEmailParam,
                            transactionViolations,
                            quickAction,
                            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                            existingTransactionDraft,
                            existingTransaction: storedTransaction,
                            draftTransactionIDs: draftTransactionIDsList,
                            isSelfTourViewed,
                            personalDetails: allPersonalDetails,
                            optimisticChatReportID,
                            optimisticTransactionID,
                        });
                    }
                    cleanupAfterSkipConfirmSubmit(overrides.shouldHandleNavigation, {
                        report,
                        action,
                        draftTransactionIDs: draftTransactionIDsList,
                        transactionID: existingTransactionID ?? optimisticTransactionID,
                        isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                        backToReport,
                        optimisticChatReportID,
                        linkedTrackedExpenseReportAction: transaction?.linkedTrackedExpenseReportAction,
                    });
                };
                submitWithDismissFirst({
                    executeWrite: executeExpenseWrite,
                    destinationReportID: isTrackExpenseSubmit ? (report?.reportID ?? selfDMReport?.reportID) : report?.reportID,
                    telemetryContext: {
                        scenario: isTrackExpenseSubmit ? CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.TRACK_EXPENSE : CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.REQUEST_MONEY_MANUAL,
                        iouType,
                        requestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                        isFromGlobalCreate: isEmptyObject(report) || !report?.reportID,
                        hasReceipt: false,
                    },
                });
                return;
            }
            if (isSplitBill && !report.isOwnPolicyExpenseChat && report.participants) {
                const participantAccountIDs = Object.keys(report.participants).map((accountID) => Number(accountID));
                setSplitShares(transaction, amountInSmallestCurrencyUnits, selectedCurrency || CONST.CURRENCY.USD, participantAccountIDs, currentUserAccountIDParam);
            }
            setMoneyRequestParticipantsFromReport(transactionID, report, currentUserPersonalDetails.accountID).then(() => {
                navigateToConfirmationPage(iouType, transactionID, reportID, backToReport);
            });
            return;
        }

        // Starting from global + menu means no participant context exists yet,
        // so we need to handle participant selection based on available workspace settings
        if (shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, currentUserAccountIDParam)) {
            const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
            const targetReport = shouldAutoReport ? getPolicyExpenseChat(currentUserAccountIDParam, defaultExpensePolicy?.id) : selfDMReport;
            const transactionReportID = isSelfDM(targetReport) ? CONST.REPORT.UNREPORTED_REPORT_ID : targetReport?.reportID;
            const iouTypeTrackOrSubmit = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;
            const isReturningFromConfirmationPage = !!transaction?.participants?.length;

            const resetToDefaultWorkspace = () => {
                setTransactionReport(transactionID, {reportID: transactionReportID}, true);
                setMoneyRequestParticipantsFromReport(transactionID, targetReport, currentUserPersonalDetails.accountID).then(() => {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouTypeTrackOrSubmit, transactionID, targetReport?.reportID));
                });
            };

            if (isReturningFromConfirmationPage) {
                const isP2PChat = isParticipantP2P(transaction?.participants?.at(0));
                const isNegativeAmount = convertToBackendAmount(Number.parseFloat(amount)) < 0;

                // P2P chats don't support negative amounts, so reset to default workspace when amount is negative.
                if (isP2PChat && isNegativeAmount) {
                    resetToDefaultWorkspace();
                    return;
                }

                // Preserve user's participant selection to avoid forcing them back to default workspace.
                const iouReportID = transaction?.reportID;
                const transactionAssociatedReport = getReportOrReportDraftForAmount(transaction?.reportID, allReports, allReportDrafts);
                const selectedReport = iouReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? selfDMReport : transactionAssociatedReport;
                const navigationIOUType = isSelfDM(selectedReport) ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;
                const chatReportID = selectedReport?.chatReportID ?? selectedReport?.reportID;

                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, navigationIOUType, transactionID, chatReportID));
                });
            } else {
                resetToDefaultWorkspace();
            }
        } else {
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                navigateToParticipantPage(iouType, transactionID, reportID);
            });
        }
    };

    const newAmount = convertToBackendAmount(Number.parseFloat(amount));

    if (!isEditing) {
        // Edits to the amount from the splits page should reset the split shares.
        if (transaction?.splitShares) {
            resetSplitShares(transaction, newAmount, selectedCurrency, currentUserAccountIDParam, true);
        }
        navigateToNextPage();
        return;
    }

    // If the value hasn't changed, don't request to save changes on the server and just close the modal
    const transactionCurrency = getCurrency(currentTransaction);
    if (newAmount === getAmount(currentTransaction, false, false, allowNegative, disableOppositeConversion) && selectedCurrency === transactionCurrency) {
        navigateBack();
        return;
    }

    // If currency has changed, then we get the default tax rate based on currency, otherwise we use the current tax rate selected in transaction, if we have it.
    const transactionTaxCode = getTransactionDetails(currentTransaction)?.taxCode;
    const defaultTaxCode = getDefaultTaxCode(policy, currentTransaction, selectedCurrency) ?? '';
    const taxCode = (selectedCurrency !== transactionCurrency ? defaultTaxCode : transactionTaxCode) ?? defaultTaxCode;
    const taxPercentage = getTaxValue(policy, currentTransaction, taxCode) ?? '';
    const taxAmount = convertToBackendAmount(calculateTaxAmount(taxPercentage, newAmount, decimals));

    if (isSplitBill) {
        setDraftSplitTransaction(transactionID, splitDraftTransaction, {amount: newAmount, currency: selectedCurrency, taxCode, taxAmount});
        navigateBack();
        return;
    }

    // Reset split shares for non-split-bill edits (split-bill share recalculation is handled by the confirmation list).
    if (transaction?.splitShares) {
        resetSplitShares(transaction, newAmount, selectedCurrency, currentUserAccountIDParam, false);
    }

    const parentReport = report?.parentReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`] : undefined;

    updateMoneyRequestAmountAndCurrency({
        transactionID,
        transactionThreadReport: report,
        parentReport,
        parentReportNextStep,
        transactions: duplicateTransactions,
        transactionViolations: duplicateTransactionViolations,
        currency: selectedCurrency,
        amount: newAmount,
        taxAmount,
        policy,
        taxCode,
        taxValue: taxPercentage,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
        delegateAccountID,
        yourSpendPatchData,
    });
    navigateBack();
}

export {submitAmount, getIsP2PForAmount};
export type {SubmitAmountArgs};
