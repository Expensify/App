import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import buildConfirmAction from '@components/MoneyRequestConfirmationList/confirmAction';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import type {MeasurableInput, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import useAttendees from '@hooks/useAttendees';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import usePrevious from '@hooks/usePrevious';

import {isCategoryDescriptionRequired} from '@libs/CategoryUtils';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import {shouldShowConfirmationDate} from '@libs/MoneyRequestUtils';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {arePolicyRulesEnabled, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {getCategory, getCurrency, getMerchant, getRateID, hasValidModifiedAmount} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import {useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';

import type {ConfirmationDistanceState, UseConfirmationListDataParams} from './types';

import useConfirmationAmount from './useConfirmationAmount';
import useConfirmationPolicyData from './useConfirmationPolicyData';
import useConfirmationValidation from './useConfirmationValidation';
import useFormErrorManagement from './useFormErrorManagement';
import useParticipantSection from './useParticipantSection';
import useTransactionReportForConfirmation from './useTransactionReportForConfirmation';

/**
 * The errors the amount / merchant / date fields render inline rather than in the footer. Raising one of these is
 * only visible if those fields are on screen, so every reveal site reads this same set: the shared confirmation
 * switches to the transaction whose fields need fixing, and the scan variant expands "Show more".
 */
const INLINE_FIELD_ERROR_KEYS = new Set<TranslationPaths | ''>(['common.error.fieldRequired', 'common.error.invalidAmount', 'iou.error.invalidMerchant']);

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
    isConfirmed,
    isConfirming,
    shouldShowSmartScanFields = true,
    canEnterScanFieldsManually = false,
    partiallyManuallyFilledScanID,
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
    distanceState,
}: UseConfirmationListDataParams) {
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
    const scrollFocusedInputIntoView = useCallback((input: MeasurableInput) => {
        listRef.current?.scrollInputIntoView(input);
    }, []);

    const iouAmount = hasValidModifiedAmount(transaction) ? Number(transaction?.modifiedAmount) : (transaction?.amount ?? 0);
    const iouCurrencyCode = getCurrency(transaction);
    const iouMerchant = getMerchant(transaction);
    const iouCategory = getCategory(transaction);
    const iouAttendees = useAttendees(transaction);

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

    const {amountToBeUsed, formattedAmount, formattedAmountPerAttendee, isScanRequest} = useConfirmationAmount({
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
        prevSubRates,
    });

    const isFocused = useIsFocused();

    const [didConfirm, setDidConfirm] = useState(isConfirmed);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);
    const [isTaxAmountEmpty, setIsTaxAmountEmpty] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the tax-empty flag whenever the transaction changes
        setIsTaxAmountEmpty(false);
    }, [transactionID]);

    const routeError = Object.values(transaction?.errorFields?.route ?? {}).at(0);
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const shouldShowReadOnlySplits = isPolicyExpenseChat || isReadOnly || isScanRequest;
    // Both the validation gate and the clear gate below key off this, so it is computed once here rather than
    // being re-derived per hook, where the two could be updated independently.
    const shouldShowDate = shouldShowConfirmationDate(shouldShowSmartScanFields, isDistanceRequest);

    const {formError, setFormError, clearFormErrors, shouldDisplayFieldError, isMerchantEmpty, isMerchantFieldValid, isMerchantRequired, errorMessage} = useFormErrorManagement({
        transaction,
        transactionReport,
        iouMerchant,
        iouCategory,
        iouAttendees,
        policy,
        policyTags,
        policyCategories,
        currentUserPersonalDetails,
        isEditingSplitBill,
        isPolicyExpenseChat,
        isScanRequest,
        canEnterScanFieldsManually,
        partiallyManuallyFilledScanID,
        shouldShowMerchant,
        hasSmartScanFailed,
        didConfirmSplit,
        routeError,
        isTypeSplit,
        shouldShowReadOnlySplits,
        isDistanceRequest,
        isReadOnly,
        shouldShowDate,
    });

    const isCategoryRequired = !!policy?.requiresCategory && !isTypeInvoice;

    const isDescriptionRequired = isCategoryDescriptionRequired(policyCategories, iouCategory, arePolicyRulesEnabled(policy, policyCategories));

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
        selectedParticipantsProp,
        payeePersonalDetailsProp,
        formError,
        clearFormErrors,
        iouAmount,
        iouCurrencyCode,
        onOpenParticipantPicker,
    });

    const {validate} = useConfirmationValidation({
        transaction,
        transactionReport,
        transactionID,
        iouType,
        iouAmount,
        iouMerchant,
        iouCategory,
        iouCurrencyCode,
        iouAttendees,
        policy,
        policyTags,
        policyTagLists,
        policyCategories,
        selectedParticipants,
        currentUserPersonalDetails,
        isEditingSplitBill,
        isMerchantRequired,
        isMerchantFieldValid,
        isMerchantEmpty,
        shouldDisplayFieldError,
        shouldShowTax,
        isDistanceRequest,
        isDistanceRequestWithPendingRoute,
        isPerDiemRequest,
        isMovingTransactionFromTrackExpense,
        isTimeRequest,
        routeError,
        canEnterScanFieldsManually,
        partiallyManuallyFilledScanID,
        isReadOnly,
        shouldShowDate,
        isTaxAmountEmpty,
    });

    // The partially filled receipt may not be the one on screen, so bring it into view to show its inline errors.
    const validateAndRevealFields: typeof validate = (paymentType) => {
        const result = validate(paymentType);
        if (result?.errorKey && INLINE_FIELD_ERROR_KEYS.has(result.errorKey) && partiallyManuallyFilledScanID && partiallyManuallyFilledScanID !== transactionID) {
            onSwitchToTransaction?.(partiallyManuallyFilledScanID);
        }
        return result;
    };

    const confirm = buildConfirmAction({
        iouType,
        policy,
        transactionID,
        routeError,
        formError,
        isDelegateAccessRestricted,
        validate: validateAndRevealFields,
        setFormError,
        setDidConfirmSplit,
        showDelegateNoAccessModal,
        onConfirm,
        onSendMoney,
    });

    return {
        /** Handed straight to `ConfirmationListLayout`. Only `listFooterContent` differs per expense type. */
        layoutProps: {
            transactionID,
            sections,
            listRef,
            onSelectRow: navigateToParticipantPage,
            onDismissError: dismissParticipantRowError,
        },

        /**
         * The `ConfirmationFieldsProvider` props that are the same for every expense type. A variant spreads these
         * and adds only the type flags that are true for it.
         */
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
            scrollFocusedInputIntoView,
            onSubmitForm: confirm,
        },

        // Footer prop bundles, shared by every variant's footer
        amountDisplay: {amount: amountToBeUsed, formattedAmount, formattedAmountPerAttendee},
        requiredFlags: {isCategoryRequired, isMerchantRequired, isDescriptionRequired},
        visibilityFlags: {
            shouldShowSmartScanFields,
            shouldShowAmountField: !isPerDiemRequest,
            shouldShowMerchant,
            shouldShowCategories,
            shouldShowTax,
            hasParticipantSection: sections.length > 0,
        },
        errorState: {shouldDisplayFieldError, formError, clearFormErrors, setFormError},

        // Shared values, read from context by the side-effect controllers and passed on to the footers
        transaction,
        policy,
        policyForMovingExpenses,
        policyID,
        policyTags,
        policyTagLists,
        policyCategories,
        transactionID,
        iouAmount,
        iouCurrencyCode,
        iouCategory,
        customUnitRateID,
        currentUserAccountID: currentUserPersonalDetails.accountID,
        isMovingTransactionFromTrackExpense,
        isReadOnly,
        isPolicyExpenseChat,
        isDistanceRequest,
        isTypeSplit,
        isCategoryRequired,
        isFocused,
        shouldShowCategories,
        shouldShowTax,
        selectedParticipants,
        selectedParticipantsProp,
        setFormError,
        clearFormErrors,
        setIsTaxAmountEmpty,

        // Read from context by `ConfirmationFooterContent`, which owns the CTA label and the Test Drive tooltip
        confirm,
        formattedAmount,
        iouType,
        reportID,
        receiptOptions,
        isConfirmed,
        isConfirming,
        errorMessage,
        expensesNumber,
        showRemoveExpenseConfirmModal,
        isPerDiemRequest,
        isDistanceRequestWithPendingRoute,
    };
}

/**
 * The data hook for every variant except distance: resolves the policy, then derives the shared confirmation data
 * from it. The distance variant needs the policy before it can build its distance state, so it goes through
 * `useDistanceConfirmationListData` instead.
 */
function useConfirmationListData(props: MoneyRequestConfirmationListProps) {
    const {transaction, policyID, action, iouType, isPerDiemRequest} = props;
    const policyData = useConfirmationPolicyData({transaction, policyID, action, iouType, isPerDiemRequest});

    return useConfirmationListDataWithPolicy({...props, policyData});
}

export default useConfirmationListData;
export {INLINE_FIELD_ERROR_KEYS, useConfirmationListDataWithPolicy};
