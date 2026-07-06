import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {
    calculateDefaultReimbursable,
    getExistingTransactionID,
    isMovingTransactionFromTrackExpense,
    isParticipantP2P,
    navigateToConfirmationPage,
    navigateToParticipantPage,
    resolveOptimisticChatReportID,
} from '@libs/IOUUtils';
import cleanupAfterSkipConfirmSubmit from '@libs/Navigation/helpers/cleanupAfterSkipConfirmSubmit';
import type {WriteOverrides} from '@libs/Navigation/helpers/submitWithDismissFirst';
import {submitWithDismissFirst} from '@libs/Navigation/helpers/submitWithDismissFirst';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import {isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {getPolicyExpenseChat, getTransactionDetails, isMoneyRequestReport, isPolicyExpenseChat, isSelfDM, shouldEnableNegative} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {calculateTaxAmount, getAmount, getCurrency, getDefaultTaxCode, getIsFromGlobalCreate, getTaxValue, hasReceipt, hasTaxRateWithMatchingValue} from '@libs/TransactionUtils';

import {
    getMoneyRequestParticipantsFromReport,
    setMoneyRequestAmount,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
} from '@userActions/IOU/MoneyRequest';
import {sendMoneyElsewhere, sendMoneyWithWallet} from '@userActions/IOU/SendMoney';
import {resetSplitShares, setDraftSplitTransaction, setSplitShares} from '@userActions/IOU/Split';
import {requestMoney, trackExpense} from '@userActions/IOU/TrackExpense';
import {updateMoneyRequestAmountAndCurrency} from '@userActions/IOU/UpdateMoneyRequest';
import {setTransactionReport} from '@userActions/Transaction';

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
import Onyx from 'react-native-onyx';

// The values below are only consumed by submit-time helpers in this module, never during render.
// Onyx.connectWithoutView is appropriate. If React components need these values, use useOnyx instead.

let allPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => (allPersonalDetails = value),
});

let allReports: OnyxCollection<OnyxTypes.Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

let allReportDrafts: OnyxCollection<OnyxTypes.Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => (allReportDrafts = value),
});

let quickAction: OnyxEntry<OnyxTypes.QuickAction>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
    callback: (value) => (quickAction = value),
});

let introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    callback: (value) => (introSelected = value),
});

let onboarding: OnyxEntry<OnyxTypes.Onboarding>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => (onboarding = value),
});

let betas: OnyxEntry<OnyxTypes.Beta[]>;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS,
    callback: (value) => (betas = value),
});

let betaConfiguration: OnyxEntry<OnyxTypes.BetaConfiguration>;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETA_CONFIGURATION,
    callback: (value) => (betaConfiguration = value),
});

let amountOwed: OnyxEntry<number>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED,
    callback: (value) => (amountOwed = value),
});

let ownerBillingGracePeriodEnd: OnyxEntry<number>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    callback: (value) => (ownerBillingGracePeriodEnd = value),
});

let policyRecentlyUsedCurrencies: OnyxEntry<string[]>;
Onyx.connectWithoutView({
    key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
    callback: (value) => (policyRecentlyUsedCurrencies = value),
});

let recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_RECENT_WAYPOINTS,
    callback: (value) => (recentWaypoints = value),
});

let conciergeReportID: OnyxEntry<string>;
Onyx.connectWithoutView({
    key: ONYXKEYS.CONCIERGE_REPORT_ID,
    callback: (value) => (conciergeReportID = value),
});

let reportAttributesDerivedValue: OnyxEntry<ReportAttributesDerivedValue>;
Onyx.connectWithoutView({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    callback: (value) => (reportAttributesDerivedValue = value),
});

type SubmitAmountArgs = {
    report: OnyxEntry<OnyxTypes.Report>;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    splitDraftTransaction: OnyxEntry<OnyxTypes.Transaction>;
    policy: OnyxEntry<OnyxTypes.Policy>;
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

    // Submit-time collection data — passed in by the screen until follow-up PRs cache these at module scope.
    transactionDrafts: OnyxCollection<OnyxTypes.Transaction>;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
    storedTransaction: OnyxEntry<OnyxTypes.Transaction>;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    allReportNVPs: OnyxCollection<OnyxTypes.ReportNameValuePairs>;
    duplicateTransactions: OnyxCollection<OnyxTypes.Transaction>;
    duplicateTransactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
};

/**
 * Look up a report by ID across the cached `COLLECTION.REPORT` and `COLLECTION.REPORT_DRAFT`
 * collections. Returns the report-draft entry when no concrete report exists for the ID.
 *
 * Intended for submit-time call sites (e.g. inside `navigateToNextPage`) where the caches are
 * guaranteed to be hydrated. For render-time reads where a stale cache would silently misreport
 * a value, use `useReportOrReportDraft` instead so the screen re-renders when the report arrives.
 */
function getReportOrReportDraftForAmount(reportID: string | undefined): OnyxEntry<OnyxTypes.Report> {
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
 * `saveAmountAndCurrency` + `navigateToNextPage` handlers. All submit-only Onyx values are read
 * from the module-scoped `connectWithoutView` caches above.
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
    transactionDrafts,
    transactionViolations,
    storedTransaction,
    parentReportNextStep,
    policyCategories,
    userBillingGracePeriodEnds,
    allReportNVPs,
    duplicateTransactions,
    duplicateTransactionViolations,
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

        // When the currency changes, re-apply the default tax rate for the new currency so the confirmation page and the
        // created expense reflect the currency-appropriate default (e.g. the foreign default for a foreign currency).
        // Only do this when the current tax code is still the auto-applied default for the previous currency, so a tax
        // rate the user manually selected is preserved across the currency change.
        const previousCurrency = getCurrency(transaction);
        const previousDefaultTaxCode = getDefaultTaxCode(policy, transaction, previousCurrency);
        const isCurrentTaxAutoDefault = !transaction?.taxCode || transaction?.taxCode === previousDefaultTaxCode;
        // Only re-apply a currency default when the workspace actually tracks tax (mirrors the confirmation page's
        // `shouldShowTax` gate). Without this, a currency change would persist a tax code and amount on a workspace
        // that has tax tracking disabled. The amount step is always a manual expense, so distance is `false` here.
        const isTaxEnabled = isTaxTrackingEnabled(isPolicyExpenseChat(report), policy, false);

        if (isMovingTransactionFromTrackExpense(action) || (isTaxEnabled && selectedCurrency !== previousCurrency && isCurrentTaxAutoDefault)) {
            const taxCode = getDefaultTaxCode(policy, transaction, selectedCurrency);
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
                    ? getParticipantsOption(participant, allPersonalDetails)
                    : getReportOption(participant, privateIsArchived, policy, allPersonalDetails, conciergeReportID, reportAttributesReports, reportDraft);
            });
            const backendAmount = convertToBackendAmount(Number.parseFloat(amount));

            if (shouldSkipConfirmation) {
                const participant = participants.at(0);
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
                            participantParams: {
                                payeeEmail: currentUserEmailParam,
                                payeeAccountID: currentUserAccountIDParam,
                                participant: participants.at(0) ?? {},
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
                        });
                    } else {
                        const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;
                        requestMoney({
                            report,
                            betas,
                            participantParams: {
                                participant: participants.at(0) ?? {},
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
                const transactionAssociatedReport = getReportOrReportDraftForAmount(transaction?.reportID);
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

    // When the currency changes we re-apply the new currency's default tax rate, but only when the current tax rate is
    // still the auto-applied default for the previous currency. A tax rate the user picked manually is preserved across
    // the currency change (mirrors the create-flow guard in `navigateToNextPage`).
    const transactionTaxCode = getTransactionDetails(currentTransaction)?.taxCode;
    const defaultTaxCode = getDefaultTaxCode(policy, currentTransaction, selectedCurrency) ?? '';
    const previousDefaultTaxCode = getDefaultTaxCode(policy, currentTransaction, transactionCurrency);
    const isCurrentTaxAutoDefault = !transactionTaxCode || transactionTaxCode === previousDefaultTaxCode;
    // The edit path has no confirmation-page safety net, so heal a tax code that is no longer a valid rate on the
    // policy (e.g. the rate was deleted or the expense moved workspaces) by falling back to the currency default.
    const isTransactionTaxCodeValid = hasTaxRateWithMatchingValue(policy, currentTransaction);
    const taxCode = ((selectedCurrency !== transactionCurrency && isCurrentTaxAutoDefault) || !isTransactionTaxCodeValid ? defaultTaxCode : transactionTaxCode) ?? defaultTaxCode;
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

    // `parentReport` is read from the module-scope REPORT cache (introduced in PR 3); the rest
    // of the edit-branch collection data (`parentReportNextStep`, `policyCategories`,
    // `duplicateTransactions`, `duplicateTransactionViolations`) comes in via args until the
    // follow-up PR caches `NEXT_STEP`, `POLICY_CATEGORIES`, `TRANSACTION`, and
    // `TRANSACTION_VIOLATIONS` at module scope.
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
    });
    navigateBack();
}

export {submitAmount, getIsP2PForAmount, getReportOrReportDraftForAmount};
