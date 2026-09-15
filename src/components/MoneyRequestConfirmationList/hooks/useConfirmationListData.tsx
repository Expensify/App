import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import buildConfirmAction from '@components/MoneyRequestConfirmationList/confirmAction';
import ConfirmationFooterContent from '@components/MoneyRequestConfirmationList/ConfirmationFooterContent';
import type {MeasurableInput, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import useAttendees from '@hooks/useAttendees';
import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrevious from '@hooks/usePrevious';

import {isCategoryDescriptionRequired} from '@libs/CategoryUtils';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import {shouldShowConfirmationDate} from '@libs/MoneyRequestUtils';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {arePolicyRulesEnabled, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {getCategory, getCurrency, getMerchant, getRateID, hasValidModifiedAmount} from '@libs/TransactionUtils';

import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type useDistanceRequestState from './useDistanceRequestState';

import useConfirmationAmount from './useConfirmationAmount';
import useConfirmationCtaText from './useConfirmationCtaText';
import useConfirmationSections from './useConfirmationSections';
import useConfirmationValidation from './useConfirmationValidation';
import useFormErrorManagement from './useFormErrorManagement';
import usePolicyCategoriesForConfirmation from './usePolicyCategoriesForConfirmation';
import usePolicyTagsForConfirmation from './usePolicyTagsForConfirmation';
import useReceiptTraining from './useReceiptTraining';
import useSplitParticipants from './useSplitParticipants';
import useTransactionReportForConfirmation from './useTransactionReportForConfirmation';

/**
 * The parts of the distance state this hook reads. A distance variant computes the full state with
 * {@link useDistanceRequestState} and passes this slice down; every other variant passes nothing, and the
 * distance branches of the amount, CTA and validation hooks go inert.
 */
type ConfirmationDistanceState = Pick<
    ReturnType<typeof useDistanceRequestState>,
    'isDistanceRequestWithPendingRoute' | 'shouldCalculateDistanceAmount' | 'distanceRequestAmount' | 'currency' | 'prevCurrency'
>;

type UseConfirmationListDataParams = {
    /** Transaction that represents the expense */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    policyID?: string;
    reportID: string;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipants: Participant[];

    /** Payee of the expense with login */
    payeePersonalDetails?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    isReadOnly: boolean;
    isPolicyExpenseChat: boolean;
    isEditingSplitBill?: boolean;
    expensesNumber: number;
    receiptPath: string | number;
    isConfirmed?: boolean;
    isConfirming?: boolean;
    shouldShowSmartScanFields: boolean;
    canEnterScanFieldsManually: boolean;
    partiallyManuallyFilledScanID?: string;
    hasSmartScanFailed?: boolean;
    shouldHideToSection: boolean;

    /** Whether the odometer receipt is currently being stitched. Reaches the confirm button, which waits on it. */
    isLoadingReceipt: boolean;

    onConfirm?: () => void;
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;
    onOpenParticipantPicker: () => void;
    onSwitchToTransaction?: (transactionID: string) => void;
    showRemoveExpenseConfirmModal?: () => void;

    /** Expense-type flags. Each variant passes its own constants. */
    isPerDiemRequest: boolean;
    isTimeRequest: boolean;
    isDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;

    /** Only a distance variant passes this */
    distanceState?: ConfirmationDistanceState;
};

/**
 * The errors the amount / merchant / date fields render inline rather than in the footer. Raising one of these is
 * only visible if those fields are on screen, so the confirmation has to reveal them when it does.
 */
const INLINE_FIELD_ERROR_KEYS = new Set<TranslationPaths | ''>(['common.error.fieldRequired', 'common.error.invalidAmount', 'iou.error.invalidMerchant']);

/**
 * Everything the confirmation surface needs regardless of which expense type is being confirmed: the policy data,
 * the participant rows, the form errors, the validation gate, and the confirm button.
 *
 * What differs per type — the distance state, the tax controller, the receipt sections, and the footer itself —
 * stays with the variant that mounts this.
 */
function useConfirmationListData({
    transaction,
    action,
    iouType,
    policyID,
    reportID,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    isReadOnly,
    isPolicyExpenseChat,
    isEditingSplitBill,
    expensesNumber,
    receiptPath,
    isConfirmed,
    isConfirming,
    shouldShowSmartScanFields,
    canEnterScanFieldsManually,
    partiallyManuallyFilledScanID,
    hasSmartScanFailed,
    shouldHideToSection,
    isLoadingReceipt,
    onConfirm,
    onSendMoney,
    onOpenParticipantPicker,
    onSwitchToTransaction,
    showRemoveExpenseConfirmModal,
    isPerDiemRequest,
    isTimeRequest,
    isDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    distanceState,
}: UseConfirmationListDataParams) {
    // Every distance branch below goes inert for the variants that pass no distance state.
    const {
        isDistanceRequestWithPendingRoute = false,
        shouldCalculateDistanceAmount = false,
        distanceRequestAmount = 0,
        currency: distanceCurrency,
        prevCurrency,
    }: Partial<ConfirmationDistanceState> = distanceState ?? {};

    const policyCategories = usePolicyCategoriesForConfirmation(policyID);
    const {policyTags, policyTagLists} = usePolicyTagsForConfirmation(policyID);
    const transactionReport = useTransactionReportForConfirmation(transaction?.reportID);
    const {policyForMovingExpenses, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {translate} = useLocalize();

    const {isTestReceipt, shouldShowProductTrainingTooltip, renderProductTrainingTooltip} = useReceiptTraining({
        transaction,
    });

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyID,
        action,
        iouType,
        isPerDiemRequest,
    });

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();
    const listRef = useRef<SelectionListWithSectionsHandle>(null);

    // In the new manual expense flow the inline fields live in the list footer, so they can be hidden behind the keyboard.
    // We let those fields ask the list to scroll them into view when focused.
    const scrollFocusedInputIntoView = useCallback((input: MeasurableInput) => {
        listRef.current?.scrollInputIntoView(input);
    }, []);

    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    const iouAmount = hasValidModifiedAmount(transaction) ? Number(transaction?.modifiedAmount) : (transaction?.amount ?? 0);
    const iouCurrencyCode = getCurrency(transaction);
    const iouMerchant = getMerchant(transaction);
    const iouCategory = getCategory(transaction);
    const iouAttendees = useAttendees(transaction);

    const isTypeRequest = iouType === CONST.IOU.TYPE.SUBMIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.PAY;
    const isTypeInvoice = iouType === CONST.IOU.TYPE.INVOICE;
    const isFromGlobalCreateAndCanEditParticipant = !!transaction?.isFromGlobalCreate && !isPerDiemRequest && !isTimeRequest;

    const transactionID = transaction?.transactionID;
    const previousTransactionCurrency = usePrevious(transaction?.currency);
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
        prevCurrency,
        currency: distanceCurrency,
        prevSubRates,
    });

    const isManualRequest = transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL;
    const shouldForceTopEmptySections = iouType === CONST.IOU.TYPE.CREATE || isManualRequest || isScanRequest;

    const isFocused = useIsFocused();

    const [didConfirm, setDidConfirm] = useState(isConfirmed);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [isTaxAmountEmpty, setIsTaxAmountEmpty] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowMoreFields(false);
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDidConfirm(isConfirmed);
    }, [isConfirmed]);

    const splitOrRequestOptions = useConfirmationCtaText({
        expensesNumber,
        isTypeInvoice,
        isTypeSplit,
        isTypeRequest,
        iouAmount,
        iouType,
        policy,
        formattedAmount,
        receiptPath,
        isDistanceRequestWithPendingRoute,
        isPerDiemRequest,
    });

    const selectedParticipants = selectedParticipantsProp.filter((participant) => participant.selected);
    const payeePersonalDetails = payeePersonalDetailsProp ?? currentUserPersonalDetails;

    const participantRowErrors = useMemo(() => {
        if (formError !== 'iou.error.noParticipantSelected' && formError !== 'violations.missingAttendees') {
            return undefined;
        }
        return {participants: translate(formError)};
    }, [formError, translate]);

    useEffect(() => {
        if (selectedParticipants.length === 0) {
            return;
        }
        clearFormErrors(['iou.error.noParticipantSelected']);
    }, [selectedParticipants.length, clearFormErrors]);

    const dismissParticipantRowError = useCallback(() => {
        clearFormErrors(['iou.error.noParticipantSelected', 'violations.missingAttendees']);
    }, [clearFormErrors]);

    const {splitParticipants, getSplitSectionHeader} = useSplitParticipants({
        isTypeSplit,
        shouldShowReadOnlySplits,
        payeePersonalDetails,
        selectedParticipants,
        transaction,
        iouAmount,
        iouCurrencyCode,
        currentUserAccountID: currentUserPersonalDetails.accountID,
    });

    const canEditParticipant = isFromGlobalCreateAndCanEditParticipant && !isTestReceipt && (!isRestrictedToPreferredPolicy || isTypeInvoice);

    const sections = useConfirmationSections({
        isTypeSplit,
        isTypeInvoice,
        shouldHideToSection,
        shouldForceTopEmptySections,
        participantRowErrors,
        canEditParticipant,
        payeePersonalDetails,
        splitParticipants,
        selectedParticipants,
        getSplitSectionHeader,
    });

    /**
     * Navigate to the participant step
     */
    const navigateToParticipantPage = () => {
        if (!canEditParticipant) {
            return;
        }

        onOpenParticipantPicker();
    };

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
        onConfirm: () => {
            if (blockDistanceRequestIfNeeded()) {
                return;
            }
            onConfirm?.();
        },
        onSendMoney,
    });

    // These errors render inline on fields that compact mode keeps behind "Show more", so opening the section or
    // pressing Create looks like it did nothing. Done during render so it survives the remount a multi-scan switch causes.
    if (INLINE_FIELD_ERROR_KEYS.has(formError) && !showMoreFields) {
        setShowMoreFields(true);
    }

    const isCompactMode = !showMoreFields && isScanRequest && !isInLandscapeMode;

    const footerContent = isReadOnly ? undefined : (
        <ConfirmationFooterContent
            iouType={iouType}
            confirm={confirm}
            iouCurrencyCode={iouCurrencyCode}
            policyID={policyID}
            reportID={reportID}
            isConfirmed={isConfirmed}
            isConfirming={isConfirming}
            isLoadingReceipt={isLoadingReceipt}
            splitOrRequestOptions={splitOrRequestOptions}
            errorMessage={errorMessage}
            expensesNumber={expensesNumber}
            showRemoveExpenseConfirmModal={showRemoveExpenseConfirmModal}
            shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
            renderProductTrainingTooltip={renderProductTrainingTooltip}
        />
    );

    return {
        // Surface chrome, handed straight to `ConfirmationListLayout`
        sections,
        listRef,
        footerContent,
        isCompactMode,
        navigateToParticipantPage,
        dismissParticipantRowError,

        // Footer prop bundles, shared by every variant's footer
        amountDisplay: {amount: amountToBeUsed, formattedAmount, formattedAmountPerAttendee},
        requiredFlags: {isCategoryRequired, isMerchantRequired, isDescriptionRequired},
        visibilityFlags: {shouldShowSmartScanFields, shouldShowAmountField: !isPerDiemRequest, shouldShowMerchant, shouldShowCategories, shouldShowTax},
        errorState: {shouldDisplayFieldError, formError, clearFormErrors, setFormError},
        compactControls: {showMoreFields, setShowMoreFields},

        // Shared values the variants pass on to their own controllers and footers
        policy,
        policyTags,
        policyTagLists,
        policyCategories,
        policyForMovingExpenses,
        transactionID,
        iouAmount,
        iouCurrencyCode,
        iouCategory,
        customUnitRateID,
        previousTransactionCurrency,
        currentUserAccountID: currentUserPersonalDetails.accountID,
        isMovingTransactionFromTrackExpense,
        isScanRequest,
        isTypeSplit,
        isTypeInvoice,
        isCategoryRequired,
        isFocused,
        shouldShowCategories,
        shouldShowTax,
        selectedParticipants,
        didConfirm,
        confirm,
        scrollFocusedInputIntoView,
        setFormError,
        clearFormErrors,
        setIsTaxAmountEmpty,
    };
}

export default useConfirmationListData;
export type {ConfirmationDistanceState};
