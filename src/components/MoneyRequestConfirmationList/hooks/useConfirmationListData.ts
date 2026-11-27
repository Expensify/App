import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import buildConfirmAction from '@components/MoneyRequestConfirmationList/confirmAction';
import {isMissingRequiredAttendees} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import type {MeasurableInput, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import usePrevious from '@hooks/usePrevious';
import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';

import {getCategoryDescriptionHint, isCategoryDescriptionRequired} from '@libs/CategoryUtils';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import {getConfirmationAmount, isConfirmationMerchantRequired, shouldShowConfirmationDate} from '@libs/MoneyRequestUtils';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {arePolicyRulesEnabled, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {
    getAttendees,
    getCategory,
    getCurrency,
    getMerchant,
    getRateID,
    isScanRequest as isScanRequestUtil,
    shouldShowAttendees as shouldShowAttendeesTransactionUtils,
} from '@libs/TransactionUtils';

import CONST from '@src/CONST';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';

import type {ConfirmationDistanceState, ConfirmationListData, UseConfirmationListDataParams} from './types';

import useConfirmationAmount from './useConfirmationAmount';
import useConfirmationFieldErrors from './useConfirmationFieldErrors';
import useConfirmationPolicyData from './useConfirmationPolicyData';
import useConfirmationValidation from './useConfirmationValidation';
import useFormErrorManagement from './useFormErrorManagement';
import useParticipantSection from './useParticipantSection';
import useScrollToFlaggedField from './useScrollToFlaggedField';
import useTransactionReportForConfirmation from './useTransactionReportForConfirmation';

/**
 * Everything the confirmation surface needs regardless of which expense type is being confirmed: the participant
 * rows, the form errors, the validation gate, and the confirm button, all derived from an already resolved policy.
 *
 * Not called by a variant directly. `useConfirmationListData` resolves the policy and calls this for every
 * non-distance variant. `useDistanceConfirmationListData` does the same after building the distance state.
 */
function useConfirmationListDataWithPolicy({
    transaction,
    action,
    iouType,
    policyID,
    policyData,
    reportID = '',
    reportActionID,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    isReadOnly = false,
    isPolicyExpenseChat = false,
    isEditingSplitBill,
    expensesNumber = 0,
    receiptOptions,
    onToggleBillable,
    onToggleReimbursable,
    isConfirmed,
    isConfirming,
    shouldShowSmartScanFields = true,
    canEnterScanFieldsManually = false,
    siblingTransactions,
    hasSmartScanFailed,
    shouldHideToSection = false,
    onConfirm,
    onSendMoney,
    onOpenParticipantPicker,
    onSwitchToTransaction,
    showRemoveExpenseConfirmModal,
    isPerDiemRequest = false,
    isTimeRequest = false,
    isDistanceRequest = false,
    isScanRequest: isScanRequestProp = false,
    distanceState,
    onUnsavedAmountInputChange,
    onSubmitWillStart,
    isDiscardModalVisible,
}: UseConfirmationListDataParams): ConfirmationListData {
    // Every distance branch below goes inert for the variants that pass no distance state.
    const {
        isDistanceRequestWithPendingRoute = false,
        shouldCalculateDistanceAmount = false,
        distanceRequestAmount = 0,
        currency: distanceCurrency,
    }: Partial<ConfirmationDistanceState> = distanceState ?? {};

    const transactionReport = useTransactionReportForConfirmation(transaction?.reportID);
    const {policy, policyForMovingExpenses, policyCategories, policyTags, policyTagLists, shouldSelectPolicy} = policyData;

    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const listRef = useRef<SelectionListWithSectionsHandle>(null);

    // In the new manual expense flow the inline fields live in the list footer, so they can be hidden behind the keyboard.
    // We let those fields ask the list to scroll them into view when focused.
    const scrollFocusedInputIntoView = (input: MeasurableInput) => {
        listRef.current?.scrollInputIntoView(input);
    };
    const {fieldViewRefs, scrollToField} = useScrollToFlaggedField(listRef, transaction?.transactionID);

    const iouAmount = getConfirmationAmount(transaction);
    const iouCurrencyCode = getCurrency(transaction);
    const iouMerchant = getMerchant(transaction);
    const iouCategory = getCategory(transaction);
    const reportOwnerAsAttendee = useReportOwnerAsAttendee(transaction);
    const iouAttendees = getAttendees(transaction, reportOwnerAsAttendee);

    const isTypeSend = iouType === CONST.IOU.TYPE.PAY;
    const isTypeInvoice = iouType === CONST.IOU.TYPE.INVOICE;

    const transactionID = transaction?.transactionID;
    const customUnitRateID = getRateID(transaction);

    const subRates = transaction?.comment?.customUnit?.subRates ?? [];
    const prevSubRates = usePrevious(subRates);

    const shouldShowCategories = isTrackExpense
        ? !policy || shouldSelectPolicy || !!iouCategory || hasEnabledOptions(Object.values(policyCategories ?? {}))
        : (isPolicyExpenseChat || isTypeInvoice) && (!!iouCategory || hasEnabledOptions(Object.values(policyCategories ?? {})));

    const shouldShowMerchant = (shouldShowSmartScanFields || isTypeSend) && !isDistanceRequest && !isPerDiemRequest && (!isTimeRequest || action !== CONST.IOU.ACTION.CREATE);

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat || isTrackExpense, policy, isDistanceRequest, isPerDiemRequest, isTimeRequest);

    const shouldShowAttendees = shouldShowAttendeesTransactionUtils(iouType, policy);

    // In the share flow, the caller knows it is a scan before the draft is initialized.
    const isScanRequest = isScanRequestProp || isScanRequestUtil(transaction);
    const isMerchantRequired = isConfirmationMerchantRequired({isPolicyExpenseChat, isScanRequest, isEditingSplitBill, shouldShowMerchant});

    const {amountToBeUsed, formattedAmount, formattedAmountPerAttendee} = useConfirmationAmount({
        transaction,
        iouAmount,
        iouCurrencyCode,
        iouAttendees,
        isDistanceRequest,
        isDistanceRequestWithPendingRoute,
        shouldCalculateDistanceAmount,
        distanceRequestAmount,
        distanceCurrency,
        isPerDiemRequest,
        isScanRequest,
        prevSubRates,
    });

    const isFocused = useIsFocused();

    const [didConfirm, setDidConfirm] = useState(isConfirmed);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);
    // A multi-scan swaps the receipt on the same list, so the flag holds the receipt whose tax amount was emptied. It is dropped once another receipt is on screen, because coming back shows that receipt's stored 0, which is a valid tax amount.
    const [emptyTaxAmountTransactionID, setEmptyTaxAmountTransactionID] = useState<string | undefined>();
    if (emptyTaxAmountTransactionID && emptyTaxAmountTransactionID !== transactionID) {
        setEmptyTaxAmountTransactionID(undefined);
    }
    const isTaxAmountEmpty = !!transactionID && emptyTaxAmountTransactionID === transactionID;

    const routeError = Object.values(transaction?.errorFields?.route ?? {}).at(0);
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const shouldShowReadOnlySplits = isPolicyExpenseChat || isReadOnly || isScanRequest;

    // The date field is rendered under the same condition, so a hidden date is never reported missing.
    const shouldShowDate = shouldShowConfirmationDate(shouldShowSmartScanFields, isDistanceRequest);

    const currentUserLogin = currentUserPersonalDetails.email ?? currentUserPersonalDetails.login;

    // `validate` raises the footer's missing-attendees error with this same rule, so the error clears as soon as the rule passes.
    const isMissingAttendees = isMissingRequiredAttendees(transaction, {iouType, policy, policyCategories, reportOwnerAsAttendee, currentUserLogin});

    const {formError, setFormError, clearFormErrors, setConfirmError, clearConfirmError, shouldDisplayFieldError, errorMessage} = useFormErrorManagement({
        transaction,
        transactionReport,
        iouCategory,
        policy,
        policyTags,
        policyCategories,
        isEditingSplitBill,
        hasSmartScanFailed,
        didConfirmSplit,
        routeError,
        isTypeSplit,
        shouldShowReadOnlySplits,
        isMissingAttendees,
    });

    const isCategoryRequired = !!policy?.requiresCategory && !isTypeInvoice;

    const areRulesEnabled = arePolicyRulesEnabled(policy, policyCategories);
    const isDescriptionRequired = isCategoryDescriptionRequired(policyCategories, iouCategory, areRulesEnabled);

    // Only show the hint when the expense goes to a workspace with Rules on, matching when categories are shown,
    // so a track expense in Self DM doesn't pick up the hint from the fallback default workspace.
    const descriptionHint = getCategoryDescriptionHint(policyCategories, iouCategory, (isPolicyExpenseChat || isTypeInvoice) && areRulesEnabled);

    // If completing a split expense fails, set didConfirm to false to allow the user to edit the fields again
    if (isEditingSplitBill && didConfirm) {
        setDidConfirm(false);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- keep the local didConfirm in sync when the parent toggles isConfirmed
        setDidConfirm(isConfirmed);
    }, [isConfirmed]);

    const {selectedParticipants, sections, navigateToParticipantPage, dismissParticipantRowError} = useParticipantSection({
        transaction,
        iouType,
        isScanRequest,
        isTypeSplit,
        isTypeInvoice,
        isPerDiemRequest,
        isTimeRequest,
        shouldHideToSection,
        shouldShowReadOnlySplits,
        isDiscardModalVisible,
        selectedParticipantsProp,
        payeePersonalDetailsProp,
        formError,
        clearFormErrors,
        iouAmount,
        iouCurrencyCode,
        onOpenParticipantPicker,
    });

    const {validate, fieldErrors, siblingFieldErrors} = useConfirmationValidation({
        transaction,
        transactionReport,
        transactionID,
        iouType,
        iouAmount,
        iouMerchant,
        iouCategory,
        iouCurrencyCode,
        reportOwnerAsAttendee,
        policy,
        policyTags,
        policyTagLists,
        policyCategories,
        selectedParticipants,
        currentUserPersonalDetails,
        currentUserLogin,
        isEditingSplitBill,
        isMerchantRequired,
        shouldShowTax,
        isDistanceRequest,
        isDistanceRequestWithPendingRoute,
        isPerDiemRequest,
        isMovingTransactionFromTrackExpense,
        isTimeRequest,
        routeError,
        canEnterScanFieldsManually,
        isPolicyExpenseChat,
        siblingTransactions,
        isReadOnly,
        shouldShowDate,
        isTaxAmountEmpty,
        shouldShowAttendees,
    });

    const {visibleFieldErrors, revealFieldErrors} = useConfirmationFieldErrors({
        transactionID,
        fieldErrors,
        siblingFieldErrors,
        onSwitchToTransaction,
        onRevealField: scrollToField,
    });

    const confirm = buildConfirmAction({
        iouType,
        policy,
        transactionID,
        routeError,
        formError,
        isDelegateAccessRestricted,
        validate,
        setConfirmError,
        clearConfirmError,
        revealFieldErrors,
        setDidConfirmSplit,
        showDelegateNoAccessModal,
        onConfirm:
            onConfirm &&
            (() => {
                onSubmitWillStart?.();
                return onConfirm();
            }),
        onSendMoney:
            onSendMoney &&
            ((paymentMethod) => {
                onSubmitWillStart?.();
                return onSendMoney(paymentMethod);
            }),
    });

    const amountDisplay = {amount: amountToBeUsed, formattedAmount, formattedAmountPerAttendee};
    const requiredFlags = {isCategoryRequired, isMerchantRequired, isDescriptionRequired, descriptionHint};
    const visibilityFlags = {
        shouldShowSmartScanFields,
        shouldShowAmountField: !isPerDiemRequest,
        shouldShowMerchant,
        shouldShowCategories,
        shouldShowTax,
        shouldShowAttendees,
        hasParticipantSection: sections.length > 0,
    };
    const errorState = {shouldDisplayFieldError, formError, fieldErrors: visibleFieldErrors};

    return {
        /** Handed straight to `ConfirmationListLayout`. The variant adds its `listFooterContent`, its `fieldFlags`, and its controllers as children. */
        layoutProps: {
            transactionID,
            sections,
            listRef,
            isReadOnly,
            onSelectRow: navigateToParticipantPage,
            onDismissError: dismissParticipantRowError,

            footerContentProps: {
                iouType,
                confirm,
                iouCurrencyCode,
                policyID,
                reportID,
                isConfirmed,
                isConfirming,
                receiptOptions,
                errorMessage,
                expensesNumber,
                showRemoveExpenseConfirmModal,
                transaction,
                policy,
                iouAmount,
                isTypeSplit,
                formattedAmount,
                isPerDiemRequest,
                isDistanceRequestWithPendingRoute,
            },

            /** The `ConfirmationFieldsProvider` props that are the same for every expense type. */
            confirmationFieldsProviderProps: {
                transactionID,
                reportID,
                reportActionID,
                action,
                iouType,
                policyID,
                isReadOnly,
                didConfirm: !!didConfirm,
                canEnterScanFieldsManually,
                isPolicyExpenseChat,
                isDiscardModalVisible,
                isScanRequest,
                isEditingSplitBill,
                scrollFocusedInputIntoView,
                fieldViewRefs,
                onSubmitForm: confirm,
                setEmptyTaxAmountTransactionID,
                onUnsavedAmountInputChange,
            },
        },

        /** The props every variant's footer takes. A variant spreads these and adds only its footer-specific extras. */
        footerProps: {
            policy,
            policyTags,
            selectedParticipants: selectedParticipantsProp,
            amountDisplay,
            requiredFlags,
            visibilityFlags,
            errorState,
            toggleHandlers: {onToggleReimbursable, onToggleBillable},
            receiptOptions,
        },

        // Side-effect controller props, passed as props so each controller re-renders only when its own inputs change
        taxControllerProps: {
            transactionID,
            policyID,
            isReadOnly,
            shouldShowTax,
            isMovingTransactionFromTrackExpense,
            transaction,
            policy,
            policyForMovingExpenses,
            customUnitRateID,
        },
        splitCategoryTaxControllerProps: {
            transactionID,
            transaction,
            policy,
            policyCategories,
            isEditingSplitBill,
        },
        splitBillControllerProps: {
            transaction,
            isTypeSplit,
            iouAmount,
            iouCurrencyCode,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            isFocused,
            setFormError,
        },
        fieldAutoSelectProps: {
            transactionID,
            transaction,
            policyCategories,
            policyTagLists,
            policyTags,
            policy,
            shouldShowCategories,
            isCategoryRequired,
            iouCategory,
            isMovingTransactionFromTrackExpense,
        },
        distanceControllerProps: {
            transactionID,
            transaction,
            policy,
            isDistanceRequest,
            isPolicyExpenseChat,
            isMovingTransactionFromTrackExpense,
            isReadOnly,
            isTypeSplit,
            customUnitRateID,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            selectedParticipants,
            selectedParticipantsProp,
            setFormError,
            clearFormErrors,
        },
    };
}

/**
 * The data hook for every variant except distance: resolves the policy, then derives the shared confirmation data
 * from it. The distance variant needs the policy before it can build its distance state, so it goes through
 * `useDistanceConfirmationListData` instead.
 */
function useConfirmationListData(props: MoneyRequestConfirmationListProps & Pick<UseConfirmationListDataParams, 'isScanRequest'>) {
    const {transaction, policyID, action, iouType, isPerDiemRequest} = props;
    const policyData = useConfirmationPolicyData({transaction, policyID, action, iouType, isPerDiemRequest});

    return useConfirmationListDataWithPolicy({...props, policyData});
}

export default useConfirmationListData;
export {useConfirmationListDataWithPolicy};
