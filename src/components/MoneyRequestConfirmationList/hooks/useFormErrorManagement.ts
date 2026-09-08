import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';

import {isConfirmationAmountMissing, isConfirmationDateMissing} from '@libs/MoneyRequestUtils';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {areRequiredFieldsEmpty, getTag, hasMissingSmartscanFields, isMerchantMissing} from '@libs/TransactionUtils';
import {isInvalidMerchantValue, isUntypedPlaceholderMerchant, isValidInputLength} from '@libs/ValidationUtils';
import {getIsViolationFixed} from '@libs/Violations/ViolationsUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

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

    /** Whether the new manual expense flow is enabled (amount/date errors surface inline) */
    isNewManualExpenseFlowEnabled: boolean;

    /** Whether the transaction is a distance request (its amount is read-only, so amount errors are not shown inline) */
    isDistanceRequest: boolean;

    /** Whether the date field is rendered (a hidden date can't be missing, so it never keeps the required error alive) */
    shouldShowDate: boolean;

    /** Whether the confirmation is read-only (a read-only date is populated server-side, so it can't be missing) */
    isReadOnly: boolean;
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
 * then suppresses errors that are already surfaced inline (missingAttendees, the tax amount
 * error, and the manual-flow amount/date/merchant required/invalid errors, except the distance-amount
 * error which has no inline surface) so they don't show twice.
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
    isNewManualExpenseFlowEnabled,
    isDistanceRequest,
    shouldShowDate,
    isReadOnly,
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

        if (!trimmedMerchant || isUntypedPlaceholderMerchant(transaction?.isMerchantSet, trimmedMerchant)) {
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
        if (formErrorRef.current !== 'iou.error.invalidMerchant' || !isMerchantFieldValid) {
            return;
        }
        setFormError('');
    }, [isMerchantFieldValid, setFormError]);

    // These reuse the very predicates `useConfirmationValidation` raises `common.error.fieldRequired` from, so the
    // clear side can never drift from the validation side and strand a required error that can no longer be cleared (#96568).
    const isAmountRequiredMissing = isConfirmationAmountMissing(transaction);
    const isDateRequiredMissing = isConfirmationDateMissing(transaction, shouldShowDate, isReadOnly);
    useEffect(() => {
        if (!isNewManualExpenseFlowEnabled || formErrorRef.current !== 'common.error.fieldRequired' || isAmountRequiredMissing || isDateRequiredMissing) {
            return;
        }
        setFormError('');
    }, [isNewManualExpenseFlowEnabled, isAmountRequiredMissing, isDateRequiredMissing, setFormError]);

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
    }, [isFocused, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit, isViolationFixed, setFormError]);

    // In the new manual expense flow the amount/date/merchant fields surface these required/invalid errors inline, so
    // repeating them at the bottom of the form would show "This field is required" twice.
    // `common.error.invalidAmount` is the one exception: it is only surfaced inline while the editable amount input is
    // rendered. Distance requests disable that input, and the read-only menu row it falls back to doesn't show the error,
    // so the distance-amount error stays in the footer. Otherwise an invalid distance expense would fail silently.
    const isSuppressedInNewFlow = (error: TranslationPaths | ''): boolean =>
        isNewManualExpenseFlowEnabled && (error === 'common.error.fieldRequired' || error === 'iou.error.invalidMerchant' || (!isDistanceRequest && error === 'common.error.invalidAmount'));

    const computeErrorMessage = (): string | undefined => {
        if (routeError) {
            return routeError;
        }
        // This runs ahead of the split branch below because splits render those same inline fields, so they duplicate the same way.
        if (isSuppressedInNewFlow(formError)) {
            return undefined;
        }
        if (isTypeSplit && !shouldShowReadOnlySplits) {
            // Splits render the debounced value, so the suppression has to be re-checked against it. `formError` clears
            // the instant the user fixes the field while `debouncedFormError` lags by USE_DEBOUNCED_STATE_DELAY, and
            // without this the suppressed error would pop into the footer for that window (#96565).
            return debouncedFormError && !isSuppressedInNewFlow(debouncedFormError) ? translate(debouncedFormError) : undefined;
        }
        // Don't show error at the bottom of the form for missing attendees — the field surfaces it inline.
        if (formError === 'violations.missingAttendees') {
            return undefined;
        }
        // The tax amount error is a parameterized message surfaced inline on the tax amount field, so skip it here.
        if (formError === 'iou.error.invalidTaxAmount') {
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
