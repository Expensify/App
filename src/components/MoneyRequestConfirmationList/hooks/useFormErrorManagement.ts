import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {areRequiredFieldsEmpty, getTag, hasMissingSmartscanFields, isMerchantMissing} from '@libs/TransactionUtils';
import {isInvalidMerchantValue, isValidInputLength} from '@libs/ValidationUtils';
import {getIsViolationFixed} from '@libs/Violations/ViolationsUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

type UseFormErrorManagementParams = {
    /** Transaction being confirmed */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Report the IOU is being created on */
    transactionReport: OnyxEntry<OnyxTypes.Report>;

    /** Current merchant value entered for the IOU */
    iouMerchant: string | undefined;

    /** Currently selected category */
    iouCategory: string;

    /** Currently selected attendees */
    iouAttendees: Attendee[];

    /** Policy the IOU belongs to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy tag lists, used for tag validation */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** Policy categories, used for category validation */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Personal details of the current user */
    currentUserPersonalDetails: CurrentUserPersonalDetails;

    /** Whether we are editing an existing split bill */
    isEditingSplitBill: boolean | undefined;

    /** Whether this is a policy-expense chat (drives merchant requirement) */
    isPolicyExpenseChat: boolean;

    /** Whether the IOU was started from a SmartScan flow */
    isScanRequest: boolean;

    /** Whether the merchant field should be visible in the UI */
    shouldShowMerchant: boolean;

    /** Whether SmartScan failed to read the receipt */
    hasSmartScanFailed: boolean | undefined;

    /** Whether the user has already confirmed the split */
    didConfirmSplit: boolean;

    /** Truthy when the route to the confirmation page has a known error */
    routeError: string | null | undefined;

    /** Whether the current IOU type is split */
    isTypeSplit: boolean;

    /** Whether splits are rendered read-only (suppresses some field errors) */
    shouldShowReadOnlySplits: boolean;
};

type UseFormErrorManagementResult = {
    /** Current form-level error key, or '' when no error is set */
    formError: TranslationPaths | '';

    /** Debounced version of `formError`, used for the visible message */
    debouncedFormError: TranslationPaths | '';

    /** Setter for the form-level error key */
    setFormError: (value: TranslationPaths | '') => void;

    /** Clears the current form error if it matches one of the provided keys */
    clearFormErrors: (errors: string[]) => void;

    /** Whether per-field errors should be shown (only true when editing a split bill) */
    shouldDisplayFieldError: boolean;

    /** Whether the merchant field is currently empty / partial */
    isMerchantEmpty: boolean;

    /** Whether the merchant field is required for this flow */
    isMerchantRequired: boolean;

    /** Whether the current merchant value passes validation */
    isMerchantFieldValid: boolean;

    /** Whether a previously surfaced violation has been resolved */
    isViolationFixed: boolean;

    /** User-visible error message derived from `routeError` and `debouncedFormError` */
    errorMessage: string | undefined;
};

/**
 * Owns the form-error state for the Money Request confirmation flow.
 *
 * Holds a debounced form-error string, exposes setters and clearing helpers used by the
 * controllers, and derives merchant validity, the violation-fixed flag, and the user-
 * visible error message. `shouldDisplayFieldError` is gated on edit-split-bill mode so
 * field-level errors only render in that flow. `errorMessage` prefers `routeError`,
 * then suppresses the missingAttendees violation when attendees aren't applicable.
 */
function useFormErrorManagement({
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
    shouldShowMerchant,
    hasSmartScanFailed,
    didConfirmSplit,
    routeError,
    isTypeSplit,
    shouldShowReadOnlySplits,
}: UseFormErrorManagementParams): UseFormErrorManagementResult {
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const [formError, debouncedFormError, setFormError] = useDebouncedState<TranslationPaths | ''>('');

    // Clear the form error if it's set to one among the list passed as an argument
    const clearFormErrors = (errors: string[]) => {
        if (!errors.includes(formError)) {
            return;
        }

        setFormError('');
    };

    const shouldDisplayFieldError: boolean =
        !!isEditingSplitBill &&
        ((!!hasSmartScanFailed && hasMissingSmartscanFields(transaction, transactionReport)) || (didConfirmSplit && areRequiredFieldsEmpty(transaction, transactionReport)));

    const isMerchantEmpty = !iouMerchant || isMerchantMissing(transaction);
    const isMerchantRequired = isPolicyExpenseChat && (!isScanRequest || !!isEditingSplitBill) && shouldShowMerchant;
    const isMerchantFieldValid = (() => {
        const merchantValue = iouMerchant ?? '';
        const trimmedMerchant = merchantValue.trim();
        const {isValid} = isValidInputLength(merchantValue, CONST.MERCHANT_NAME_MAX_BYTES);

        if (!isValid) {
            return false;
        }

        if (!trimmedMerchant) {
            return !isMerchantRequired;
        }

        return !isInvalidMerchantValue(trimmedMerchant);
    })();

    const isViolationFixed = getIsViolationFixed(formError, {
        category: iouCategory,
        tag: getTag(transaction),
        taxCode: transaction?.taxCode,
        taxValue: transaction?.taxValue,
        policyCategories,
        policyTagLists: policyTags,
        policyTaxRates: policy?.taxRates?.taxes,
        iouAttendees,
        currentUserPersonalDetails,
        isAttendeeTrackingEnabled: isAttendeeTrackingEnabled(policy),
        isControlPolicy: policy?.type === CONST.POLICY.TYPE.CORPORATE,
    });

    // Mirror formError into a ref so the effect below can read the current value without listing
    // formError as a dependency. We don't want this effect to re-run just because formError changed —
    // it should only react to focus / validation-state changes. (setFormError is stable across
    // renders because useDebouncedState memoizes its setter.)
    const formErrorRef = useRef(formError);
    useEffect(() => {
        formErrorRef.current = formError;
    }, [formError]);

    useEffect(() => {
        const currentFormError = formErrorRef.current;
        if (shouldDisplayFieldError && didConfirmSplit) {
            setFormError('iou.error.genericSmartscanFailureMessage');
            return;
        }
        if (shouldDisplayFieldError && hasSmartScanFailed) {
            setFormError('iou.receiptScanningFailed');
            return;
        }
        if (currentFormError === 'iou.error.invalidMerchant' && isMerchantFieldValid) {
            setFormError('');
            return;
        }
        // Check 1: If formError does NOT start with "violations.", clear it and return
        // Reset the form error whenever the screen gains or loses focus
        // but preserve violation-related errors since those represent real validation issues
        // that can only be resolved by fixing the underlying issue
        if (currentFormError && !currentFormError.startsWith(CONST.VIOLATIONS_PREFIX)) {
            setFormError('');
            return;
        }
        // Check 2: Only reached if formError STARTS with "violations."
        // Clear any violation error if the user has fixed the underlying issue
        if (isViolationFixed) {
            setFormError('');
        }
    }, [isFocused, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit, isViolationFixed, isMerchantFieldValid, setFormError]);

    const computeErrorMessage = (): string | undefined => {
        if (routeError) {
            return routeError;
        }
        if (isTypeSplit && !shouldShowReadOnlySplits) {
            return debouncedFormError ? translate(debouncedFormError) : undefined;
        }
        // Don't show error at the bottom of the form for missing attendees — the field surfaces it inline.
        if (formError === 'violations.missingAttendees') {
            return undefined;
        }
        return formError ? translate(formError) : undefined;
    };
    const errorMessage = computeErrorMessage();

    return {
        formError,
        debouncedFormError,
        setFormError,
        clearFormErrors,
        shouldDisplayFieldError,
        isMerchantEmpty,
        isMerchantRequired,
        isMerchantFieldValid,
        isViolationFixed,
        errorMessage,
    };
}

export default useFormErrorManagement;
