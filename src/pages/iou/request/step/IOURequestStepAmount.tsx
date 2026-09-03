import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import useLocalize from '@hooks/useLocalize';
import useMoneyRequestPolicyTags from '@hooks/useMoneyRequestPolicyTags';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePreMountDestination from '@hooks/usePreMountDestination';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';

import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getIsP2PForAmount, submitAmount} from '@libs/IOUAmountSubmission';
import {isLookingAroundSearchRoutingActive, isMovingTransactionFromTrackExpense, isSelfDMSoleDestination} from '@libs/IOUUtils';
import Log from '@libs/Log';
import {getAmountHasUnsavedChanges} from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {getTransactionDetails, isMoneyRequestReport, isPolicyExpenseChat, isSelfDM, shouldEnableNegative} from '@libs/ReportUtils';
import {getRequestType, isDistanceRequest, isExpenseUnreported} from '@libs/TransactionUtils';

import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import type {MoneyRequestAmountFormHandle} from '@pages/iou/MoneyRequestAmountForm';

import {getMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report, SelectedTabRequest} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import {isLookingAroundUserSelector, isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';

import type {AmountSubmitData} from './AmountSubmitDataSync';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import AmountSubmitDataSync from './AmountSubmitDataSync';
import getSkipConfirmationPreMountDestinationRoute from './confirmation/getSkipConfirmationPreMountDestinationRoute';
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

const selectReportPolicyID = (report: OnyxEntry<Report>) => report?.policyID;

function IOURequestStepAmount({
    report,
    route: {
        params: {iouType, reportID, transactionID = '-1', backTo, action, backToReport, reportActionID},
    },
    transaction,
    shouldKeepUserInput = false,
}: IOURequestStepAmountProps) {
    const {translate, dateFnsLocale, formatPhoneNumber} = useLocalize();
    const {isOffline} = useNetwork();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
    const textInput = useRef<BaseTextInputRef | null>(null);
    const amountFormRef = useRef<MoneyRequestAmountFormHandle | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const iouRequestType = getRequestType(transaction);
    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const participantPolicyID = transaction?.participants?.find((participant) => participant.isPolicyExpenseChat)?.policyID;
    const policyID = (isTrackExpense ? policyForMovingExpensesID : report?.policyID) ?? participantPolicyID;

    const isReportArchived = useReportIsArchived(report?.reportID);
    const isIouReport = isMoneyRequestReport(report);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const iouOrExpenseReport = useReportOrReportDraft(report?.chatReportID);
    const actualChatReportID = iouOrExpenseReport && isMoneyRequestReport(iouOrExpenseReport) ? iouOrExpenseReport.chatReportID : undefined;
    const actualChatReport = useReportOrReportDraft(actualChatReportID);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [isLookingAroundUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isLookingAroundUserSelector});

    const isEditing = action === CONST.IOU.ACTION.EDIT;

    // Owned by AmountSubmitDataSync below; keeps submit-only subs out of the render path.
    const submitDataRef = useRef<AmountSubmitData | null>(null);

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
    // `undefined` until the form reports a change, so the baseline below stands in and a prefilled amount starts clean.
    const [typedAmount, setTypedAmount] = useState<string | undefined>(undefined);
    const [isSignDirty, setIsSignDirty] = useState(false);
    const [prevRequestType, setPrevRequestType] = useState(iouRequestType);
    if (prevRequestType !== iouRequestType) {
        setPrevRequestType(iouRequestType);
        setTypedAmount(undefined);
        setIsSignDirty(false);
    }

    const baselineAmount = transactionAmount ? convertToFrontendAmountAsString(transactionAmount, decimals) : '';

    const {suppressDiscardPrompt} = useDiscardChangesConfirmation({
        getHasUnsavedChanges: () =>
            getAmountHasUnsavedChanges({
                typedAmount: typedAmount ?? baselineAmount,
                committedAmount: transactionAmount,
                isCreateEntry: isAmountCreateEntry,
                selectedCurrency,
                originalCurrency,
                isSignChanged: isSignDirty,
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

    // Both self-DM signals are ORed on purpose. The navigate half (IOUAmountSubmission) reads participants at submit time,
    // but on a quick-action flow they are not populated yet when this pre-mount decision runs, so the participants check
    // alone misses and the self-DM gets pre-inserted - then navigateAfterExpenseCreate reveals it instead of going to Search.
    // isSelfDM(report) answers the question this site actually cares about ("is the report I am about to pre-insert the
    // self-DM?") and is available immediately.
    const skipConfirmationPreMountRoute = getSkipConfirmationPreMountDestinationRoute(
        shouldSkipConfirmation,
        report?.reportID,
        isLookingAroundSearchRoutingActive(isLookingAroundUser, isOffline),
        isSelfDM(report) || isSelfDMSoleDestination(transaction?.participants ?? [], iouType, currentUserPersonalDetails.accountID),
    );
    usePreMountDestination(skipConfirmationPreMountRoute);

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

    const saveAndNavigateBack = () => {
        Navigation.goBack(backTo, {shouldSkipFocusRestore: true});
    };

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allReportNVPs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const reportIDToCheck = isMoneyRequestReport(report) ? report?.chatReportID : report?.reportID;
    const [reportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportIDToCheck}`);
    const reportAttributesDerived = useReportAttributes();

    const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID);
    const participants = selectedParticipants.map((participant) => {
        const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const privateIsArchived = !!allReportNVPs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`]?.private_isArchived;
        return participantAccountID
            ? getParticipantsOption(participant, personalDetails, translate)
            : getReportOption(participant, privateIsArchived, policy, personalDetails, conciergeReportID, reportAttributesDerived, reportDraft, currentUserPersonalDetails.accountID, {
                  translate,
                  dateFnsLocale,
              });
    });
    const participant = participants.at(0);
    const policyTags = useMoneyRequestPolicyTags({
        moneyRequestReportID: isIouReport ? report?.reportID : undefined,
        parentChatReportPolicyID: isMovingTransactionFromTrackExpense(action) ? undefined : report?.policyID,
        participantReportID: participant?.reportID,
    });
    const [parentReportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {selector: selectReportPolicyID});
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReportPolicyID)}`);

    const handleSubmit = ({amount, paymentMethod}: {amount: string; paymentMethod?: PaymentMethodType}) => {
        const submitData = submitDataRef.current;
        if (!submitData) {
            Log.hmmm('[IOURequestStepAmount] Skipping amount submit: submit data not ready');
            return;
        }
        suppressDiscardPrompt();
        submitAmount({
            getCurrencyDecimals,
            getCurrencySymbol,
            translate,
            dateFnsLocale,
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
            navigateBack: saveAndNavigateBack,
            amount,
            paymentMethod,
            formatPhoneNumber,
            isTrackIntentUser,
            isOffline,
            policyTags,
            reportPolicyTags,
            ...submitData,
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
            <AmountSubmitDataSync
                report={report}
                transaction={transaction}
                transactionID={transactionID}
                policyID={policyID}
                isEditing={isEditing}
                submitDataRef={submitDataRef}
            />
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
                onAmountChange={setTypedAmount}
                onSignDirtyChange={setIsSignDirty}
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
