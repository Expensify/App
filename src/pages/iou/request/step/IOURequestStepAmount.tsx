import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useSkipConfirmationPreInsert from '@hooks/useSkipConfirmationPreInsert';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getExistingTransactionID} from '@libs/IOUUtils';
import {getAmountHasUnsavedChanges} from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTransactionDetails, isMoneyRequestReport, isPolicyExpenseChat, shouldEnableNegative} from '@libs/ReportUtils';
import {getRequestType, isDistanceRequest, isExpenseUnreported} from '@libs/TransactionUtils';

import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import type {MoneyRequestAmountFormHandle} from '@pages/iou/MoneyRequestAmountForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {SelectedTabRequest} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import {getIsP2PForAmount, submitAmount} from './AmountSubmission';
import IOURequestStepCurrencyModal from './IOURequestStepCurrencyModal';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepAmountProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_AMOUNT | typeof SCREENS.MONEY_REQUEST.CREATE> & {
    /** The transaction object being modified in Onyx */
    transaction: OnyxEntry<Transaction>;

    /** Whether the user input should be kept or not */
    shouldKeepUserInput?: boolean;
};

function IOURequestStepAmount({
    report,
    route: {
        params: {iouType, reportID, transactionID = '-1', backTo, action, backToReport, reportActionID},
    },
    transaction,
    shouldKeepUserInput = false,
}: IOURequestStepAmountProps) {
    const {translate} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
    const textInput = useRef<BaseTextInputRef | null>(null);
    const amountFormRef = useRef<MoneyRequestAmountFormHandle | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const iouRequestType = getRequestType(transaction);
    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const policyID = isTrackExpense ? policyForMovingExpensesID : report?.policyID;

    const selfDMReport = useSelfDMReport();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const iouOrExpenseReport = useReportOrReportDraft(report?.chatReportID);
    const actualChatReportID = iouOrExpenseReport && isMoneyRequestReport(iouOrExpenseReport) ? iouOrExpenseReport.chatReportID : undefined;
    const actualChatReport = useReportOrReportDraft(actualChatReportID);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: validTransactionDraftsSelector,
    });
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allReportNVPs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const existingTransactionID = getExistingTransactionID(transaction?.linkedTrackedExpenseReportAction);
    const [storedTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(existingTransactionID)}`);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(isEditing && transactionID ? [transactionID] : []);

    // When editing, the `report` is the transaction thread which only has the current user as participant.
    // To correctly determine if this is a P2P expense, we need to traverse to the actual chat report
    // (e.g., the 1:1 DM) via the IOU/expense report's chatReportID.
    const chatReportForP2PCheck = useMemo(() => {
        if (!isEditing) {
            return report;
        }
        // When editing, report is the transaction thread. We need to get the actual chat report.
        // Transaction thread's chatReportID points to the IOU/expense report,
        // and the IOU/expense report's chatReportID points to the actual chat.
        if (iouOrExpenseReport && isMoneyRequestReport(iouOrExpenseReport) && iouOrExpenseReport.chatReportID) {
            return actualChatReport;
        }
        // Fallback to the passed report if we can't traverse
        return report;
    }, [isEditing, report, iouOrExpenseReport, actualChatReport]);
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
    const [selectedCurrency, setSelectedCurrency] = useState(originalCurrency);
    const decimals = getCurrencyDecimals(selectedCurrency || CONST.CURRENCY.USD);

    const isAmountCreateEntry = !backTo && !isEditing;
    const {suppressDiscardPrompt} = useDiscardChangesConfirmation({
        getHasUnsavedChanges: () =>
            getAmountHasUnsavedChanges({
                typedAmount: amountFormRef.current?.getNumber() ?? '',
                committedAmount: transactionAmount,
                isCreateEntry: isAmountCreateEntry,
                selectedCurrency,
                originalCurrency,
            }),
        onCancel: () => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
        },
    });

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);
    const isUnreportedDistanceExpense = isEditing && isDistanceRequest(transaction) && isExpenseUnreported(transaction);

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace request, as
    // the user will have to add a merchant.
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (isSplitBill || !skipConfirmation || !report?.reportID) {
            return false;
        }

        return !(isReportArchived || isPolicyExpenseChat(report));
    }, [report, isSplitBill, skipConfirmation, isReportArchived]);

    useSkipConfirmationPreInsert(shouldSkipConfirmation, report?.reportID);

    useFocusEffect(
        useCallback(() => {
            if (isCurrencyPickerVisible) {
                return;
            }
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION + 100);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, [isCurrencyPickerVisible]),
    );

    // This useEffect is to update the selected currency when the we came back from confirmation page
    useEffect(() => {
        setSelectedCurrency(originalCurrency);
    }, [originalCurrency]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const handleSubmit = ({amount, paymentMethod}: {amount: string; paymentMethod?: PaymentMethodType}) => {
        suppressDiscardPrompt();
        submitAmount({
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
        });
    };

    const hideCurrencyPicker = () => {
        Keyboard.dismiss();
        setIsCurrencyPickerVisible(false);
    };

    const updateSelectedCurrency = (value: string) => {
        setSelectedCurrency(value);
    };

    const showCurrencyPicker = () => {
        if (isTextInputFocused(textInput)) {
            textInput.current?.blur();
        }
        setIsCurrencyPickerVisible(true);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.amount')}
            onBackButtonPress={navigateBack}
            testID="IOURequestStepAmount"
            shouldShowWrapper={!!backTo || isEditing}
            includeSafeAreaPaddingBottom
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            shouldEnableKeyboardAvoidingView={false}
        >
            <IOURequestStepCurrencyModal
                isPickerVisible={isCurrencyPickerVisible}
                hidePickerModal={hideCurrencyPicker}
                headerText={translate('common.selectCurrency')}
                value={selectedCurrency}
                onInputChange={updateSelectedCurrency}
            />
            <MoneyRequestAmountForm
                isEditing={!!backTo || isEditing}
                currency={selectedCurrency}
                amount={transactionAmount}
                amountFormRef={amountFormRef}
                skipConfirmation={shouldSkipConfirmation ?? false}
                iouType={iouType}
                policyID={policy?.id}
                ref={(e: BaseTextInputRef | null) => {
                    textInput.current = e;
                }}
                shouldKeepUserInput={transaction?.shouldShowOriginalAmount}
                onCurrencyButtonPress={showCurrencyPicker}
                onSubmitButtonPress={handleSubmit}
                allowFlippingAmount={!isSplitBill && allowNegative}
                selectedTab={iouRequestType as SelectedTabRequest}
                chatReportID={reportID}
                isP2P={getIsP2PForAmount({
                    chatReportForP2P: chatReportForP2PCheck,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                })}
                isCurrencyPressable={!isUnreportedDistanceExpense}
            />
        </StepScreenWrapper>
    );
}

const IOURequestStepAmountWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepAmount, true);

const IOURequestStepAmountWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepAmountWithWritableReportOrNotFound, true);

// Version without withWritableReportOrNotFound, for use when parent already provides report prop
const IOURequestStepAmountWithTransactionOnly = withFullTransactionOrNotFound(IOURequestStepAmount, true);

export default IOURequestStepAmountWithFullTransactionOrNotFound;
export {IOURequestStepAmountWithTransactionOnly};
