import {useFocusEffect} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import {setTransactionReport} from '@libs/actions/Transaction';
import {createDraftTransaction, removeDraftTransaction} from '@libs/actions/TransactionEdit';
import {convertToBackendAmount, isValidCurrencyCode} from '@libs/CurrencyUtils';
import {navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {getPolicyExpenseChat, getReportOrDraftReport, getTransactionDetails, isPolicyExpenseChat, isSelfDM, shouldEnableNegative} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {calculateTaxAmount, getAmount, getCurrency, getDefaultTaxCode, getRequestType, getTaxValue} from '@libs/TransactionUtils';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import {
    getMoneyRequestParticipantsFromReport,
    requestMoney,
    resetSplitShares,
    sendMoneyElsewhere,
    sendMoneyWithWallet,
    setDraftSplitTransaction,
    setMoneyRequestAmount,
    setMoneyRequestParticipantsFromReport,
    setSplitShares,
    trackExpense,
    updateMoneyRequestAmountAndCurrency,
} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SelectedTabRequest} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type AmountParams = {
    amount: string;
    paymentMethod?: PaymentMethodType;
};

type IOURequestStepAmountProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_AMOUNT | typeof SCREENS.MONEY_REQUEST.CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<Transaction>;

        /** Whether the user input should be kept or not */
        shouldKeepUserInput?: boolean;
    };

function IOURequestStepAmount({
    report,
    route: {
        params: {iouType, reportID, transactionID = '-1', backTo, pageIndex, action, currency: selectedCurrency = '', backToReport, reportActionID},
    },
    transaction,
    currentUserPersonalDetails,
    shouldKeepUserInput = false,
}: IOURequestStepAmountProps) {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSaveButtonPressed = useRef(false);
    const iouRequestType = getRequestType(transaction);
    const policyID = report?.policyID;

    const isReportArchived = useReportIsArchived(report?.reportID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: true});
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactionID ? [transactionID] : []);
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isCreateAction = action === CONST.IOU.ACTION.CREATE;
    const isSubmitAction = action === CONST.IOU.ACTION.SUBMIT;
    const isSubmitType = iouType === CONST.IOU.TYPE.SUBMIT;
    const isEditingSplitBill = isEditing && isSplitBill;
    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const allowNegative = shouldEnableNegative(report, policy, iouType, transaction?.participants);
    const disableOppositeConversion = isCreateAction || (isSubmitType && isSubmitAction);
    const {amount: transactionAmount} = getTransactionDetails(currentTransaction, undefined, undefined, allowNegative, disableOppositeConversion) ?? {amount: 0};
    const {currency: originalCurrency} = getTransactionDetails(isEditing && !isEmptyObject(draftTransaction) ? draftTransaction : transaction) ?? {currency: CONST.CURRENCY.USD};
    const currency = isValidCurrencyCode(selectedCurrency) ? selectedCurrency : originalCurrency;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);
    const shouldGenerateTransactionThreadReport = !isBetaEnabled(CONST.BETAS.NO_OPTIMISTIC_TRANSACTION_THREADS);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace request, as
    // the user will have to add a merchant.
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (isSplitBill || !skipConfirmation || !report?.reportID) {
            return false;
        }

        return !(isReportArchived || isPolicyExpenseChat(report));
    }, [report, isSplitBill, skipConfirmation, isReportArchived]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    useEffect(() => {
        if (!isEditing) {
            return;
        }
        // A temporary solution to not prevent users from editing the currency
        // We create a backup transaction and use it to save the currency and remove this transaction backup if we don't save the amount
        // It should be removed after this issue https://github.com/Expensify/App/issues/34607 is fixed
        createDraftTransaction(isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction);

        return () => {
            if (isSaveButtonPressed.current) {
                return;
            }
            removeDraftTransaction(transaction?.transactionID);
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const navigateToCurrencySelectionPage = () => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CURRENCY.getRoute(action, iouType, transactionID, reportID, pageIndex, currency, Navigation.getActiveRoute()));
    };

    const navigateToConfirmationPage = () => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, backToReport));
                break;
            case CONST.IOU.TYPE.SEND:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
        }
    };

    const navigateToNextPage = ({amount, paymentMethod}: AmountParams) => {
        isSaveButtonPressed.current = true;
        const amountInSmallestCurrencyUnits = convertToBackendAmount(Number.parseFloat(amount));

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        setMoneyRequestAmount(transactionID, amountInSmallestCurrencyUnits, currency || CONST.CURRENCY.USD, shouldKeepUserInput);

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because either:
        // - The user started this flow from using the + button in the composer inside a report.
        // - The user started this flow from using the global create menu by selecting the Track expense option.
        // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        // If the user is started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
        if (report?.reportID && !isReportArchived && iouType !== CONST.IOU.TYPE.CREATE) {
            const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID);
            const participants = selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                return participantAccountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant, reportAttributesDerived);
            });
            const backendAmount = convertToBackendAmount(Number.parseFloat(amount));

            if (shouldSkipConfirmation) {
                if (iouType === CONST.IOU.TYPE.PAY || iouType === CONST.IOU.TYPE.SEND) {
                    if (paymentMethod && paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                        sendMoneyWithWallet(report, backendAmount, currency, '', currentUserAccountIDParam, participants.at(0) ?? {});
                        return;
                    }
                    sendMoneyElsewhere(report, backendAmount, currency, '', currentUserAccountIDParam, participants.at(0) ?? {});
                    return;
                }
                if (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.REQUEST) {
                    requestMoney({
                        report,
                        participantParams: {
                            participant: participants.at(0) ?? {},
                            payeeEmail: currentUserEmailParam,
                            payeeAccountID: currentUserAccountIDParam,
                        },
                        transactionParams: {
                            amount: backendAmount,
                            currency,
                            created: transaction?.created ?? '',
                            merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                            attendees: transaction?.comment?.attendees,
                        },
                        backToReport,
                        shouldGenerateTransactionThreadReport,
                        isASAPSubmitBetaEnabled,
                        currentUserAccountIDParam,
                        currentUserEmailParam,
                        transactionViolations,
                    });
                    return;
                }
                if (iouType === CONST.IOU.TYPE.TRACK) {
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
                            currency: currency ?? 'USD',
                            created: transaction?.created,
                            merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                        },
                        isASAPSubmitBetaEnabled,
                    });
                    return;
                }
            }
            if (isSplitBill && !report.isOwnPolicyExpenseChat && report.participants) {
                const participantAccountIDs = Object.keys(report.participants).map((accountID) => Number(accountID));
                setSplitShares(transaction, amountInSmallestCurrencyUnits, currency || CONST.CURRENCY.USD, participantAccountIDs);
            }
            setMoneyRequestParticipantsFromReport(transactionID, report, currentUserPersonalDetails.accountID).then(() => {
                navigateToConfirmationPage();
            });
            return;
        }

        // Starting from global + menu means no participant context exists yet,
        // so we need to handle participant selection based on available workspace settings
        if (
            iouType === CONST.IOU.TYPE.CREATE &&
            isPaidGroupPolicy(defaultExpensePolicy) &&
            defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
            !shouldRestrictUserBillableActions(defaultExpensePolicy.id)
        ) {
            const activePolicyExpenseChat = getPolicyExpenseChat(currentUserAccountIDParam, defaultExpensePolicy?.id);
            const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
            const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;
            const isReturningFromConfirmationPage = !!transaction?.participants?.length;

            const resetToDefaultWorkspace = () => {
                setTransactionReport(transactionID, {reportID: transactionReportID}, true);
                setMoneyRequestParticipantsFromReport(transactionID, activePolicyExpenseChat, currentUserPersonalDetails.accountID).then(() => {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, activePolicyExpenseChat?.reportID));
                });
            };

            if (isReturningFromConfirmationPage) {
                const firstParticipant = transaction?.participants?.at(0);
                const isP2PChat = isParticipantP2P(firstParticipant);
                const isNegativeAmount = convertToBackendAmount(Number.parseFloat(amount)) < 0;

                // P2P chats don't support negative amounts, so reset to default workspace when amount is negative.
                if (isP2PChat && isNegativeAmount) {
                    resetToDefaultWorkspace();
                    return;
                }

                // Preserve user's participant selection to avoid forcing them back to default workspace.
                const iouReportID = transaction?.reportID;
                const selectedReport = iouReportID ? getReportOrDraftReport(iouReportID) : null;
                const navigationIOUType = isSelfDM(selectedReport) ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;
                const chatReportID = selectedReport?.chatReportID ?? iouReportID;

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

    const saveAmountAndCurrency = ({amount, paymentMethod}: AmountParams) => {
        const newAmount = convertToBackendAmount(Number.parseFloat(amount));

        // Edits to the amount from the splits page should reset the split shares.
        if (transaction?.splitShares) {
            resetSplitShares(transaction, newAmount, currency);
        }

        if (!isEditing) {
            navigateToNextPage({amount, paymentMethod});
            return;
        }

        // If the value hasn't changed, don't request to save changes on the server and just close the modal
        const transactionCurrency = getCurrency(currentTransaction);
        if (newAmount === getAmount(currentTransaction, false, false, allowNegative, disableOppositeConversion) && currency === transactionCurrency) {
            navigateBack();
            return;
        }

        // If currency has changed, then we get the default tax rate based on currency, otherwise we use the current tax rate selected in transaction, if we have it.
        const transactionTaxCode = getTransactionDetails(currentTransaction)?.taxCode;
        const defaultTaxCode = getDefaultTaxCode(policy, currentTransaction, currency) ?? '';
        const taxCode = (currency !== transactionCurrency ? defaultTaxCode : transactionTaxCode) ?? defaultTaxCode;
        const taxPercentage = getTaxValue(policy, currentTransaction, taxCode) ?? '';
        const taxAmount = convertToBackendAmount(calculateTaxAmount(taxPercentage, newAmount, currency ?? CONST.CURRENCY.USD));

        if (isSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {amount: newAmount, currency, taxCode, taxAmount});
            navigateBack();
            return;
        }

        updateMoneyRequestAmountAndCurrency({
            transactionID,
            transactionThreadReportID: reportID,
            transactions: duplicateTransactions,
            transactionViolations: duplicateTransactionViolations,
            currency,
            amount: newAmount,
            taxAmount,
            policy,
            taxCode,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
        });
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.amount')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepAmount.displayName}
            shouldShowWrapper={!!backTo || isEditing}
            includeSafeAreaPaddingBottom
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            <MoneyRequestAmountForm
                isEditing={!!backTo || isEditing}
                currency={currency}
                amount={transactionAmount}
                skipConfirmation={shouldSkipConfirmation ?? false}
                iouType={iouType}
                policyID={policy?.id}
                ref={(e: BaseTextInputRef | null) => {
                    textInput.current = e;
                }}
                shouldKeepUserInput={transaction?.shouldShowOriginalAmount}
                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                onSubmitButtonPress={saveAmountAndCurrency}
                allowFlippingAmount={!isSplitBill && allowNegative}
                selectedTab={iouRequestType as SelectedTabRequest}
                chatReportID={reportID}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepAmount.displayName = 'IOURequestStepAmount';

/**
 * Check if the participant is a P2P chat
 */
function isParticipantP2P(participant: {accountID?: number; isPolicyExpenseChat?: boolean} | undefined): boolean {
    return !!(participant?.accountID && !participant.isPolicyExpenseChat);
}

const IOURequestStepAmountWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepAmount);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepAmountWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepAmountWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepAmountWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepAmountWithWritableReportOrNotFound);

export default IOURequestStepAmountWithFullTransactionOrNotFound;
export {isParticipantP2P};
