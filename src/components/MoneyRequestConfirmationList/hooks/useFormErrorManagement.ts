import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';

import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {areRequiredFieldsEmpty, getTag, hasMissingSmartscanFields} from '@libs/TransactionUtils';
import {getIsViolationFixed} from '@libs/Violations/ViolationsUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';

type UseFormErrorManagementParams = {
    /** Transaction being confirmed */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Report the IOU is being created on */
    transactionReport: OnyxEntry<OnyxTypes.Report>;

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

    currentUserPersonalDetails: CurrentUserPersonalDetails;

    /** Whether we are editing an existing split bill */
    isEditingSplitBill: boolean | undefined;

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

    /** Whether the transaction is a distance request (its amount is read-only, so amount errors are not shown inline) */
    isDistanceRequest: boolean;
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

    /** Sets the form error for a check that blocked confirming, and remembers that the confirm set it */
    setConfirmError: (error: TranslationPaths) => void;

    /** Drops the form error only while it is the one the last confirm set, so an error raised outside validation stays */
    clearConfirmError: () => void;

    /** Whether per-field errors should be shown (only true when editing a split bill) */
    shouldDisplayFieldError: boolean;

    /** Whether a previously surfaced violation has been resolved */
    isViolationFixed: boolean;

    /** User-visible error message derived from `routeError` and `debouncedFormError` */
    errorMessage: string | undefined;
};

/**
 * Owns the form-error state for the Money Request confirmation flow.
 *
 * Holds a debounced form-error string, exposes setters and clearing helpers used by the
 * controllers, and derives the violation-fixed flag and the user-visible error message.
 * `shouldDisplayFieldError` is gated on edit-split-bill mode so field-level errors only render in
 * that flow. `errorMessage` prefers `routeError`, then leaves out the errors their own field already
 * shows (missingAttendees, the tax amount error, and the invalid amount an edited split flags as the
 * user types) so they don't show twice.
 * The amount, date and merchant errors of a blocked confirm aren't held here at all: they are derived
 * by `getConfirmationFieldErrors` and shown through `useConfirmationFieldErrors`.
 */
function useFormErrorManagement({
    transaction,
    transactionReport,
    iouCategory,
    iouAttendees,
    policy,
    policyTags,
    policyCategories,
    currentUserPersonalDetails,
    isEditingSplitBill,
    hasSmartScanFailed,
    didConfirmSplit,
    routeError,
    isTypeSplit,
    shouldShowReadOnlySplits,
    isDistanceRequest,
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

    // Validation raises a confirm's own error again on the next confirm, so a confirm blocked by a field error can drop it, but an error set outside validation would not come back and has to stay.
    const [confirmErrorKey, setConfirmErrorKey] = useState<TranslationPaths | ''>('');

    const setConfirmError = (error: TranslationPaths) => {
        setConfirmErrorKey(error);
        setFormError(error);
    };

    const clearConfirmError = () => {
        if (!formError || formError !== confirmErrorKey) {
            return;
        }
        setConfirmErrorKey('');
        setFormError('');
    };

    const shouldDisplayFieldError: boolean =
        !!isEditingSplitBill &&
        ((!!hasSmartScanFailed && hasMissingSmartscanFields(transaction, transactionReport)) || (didConfirmSplit && areRequiredFieldsEmpty(transaction, transactionReport)));

    const isViolationFixed = getIsViolationFixed(formError, {
        category: iouCategory,
        tag: getTag(transaction),
        taxCode: transaction?.taxCode,
        taxValue: transaction?.taxValue,
        policyCategories,
        policyTagLists: policyTags,
        policyTaxRates: policy?.taxRates?.taxes,
        iouAttendees,
        ownerLogin: currentUserPersonalDetails.email ?? currentUserPersonalDetails.login,
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

    // An edited split sets this error as the user types and its amount input shows it, so the footer skips it; a distance amount has no input, so its error stays.
    const isShownOnAmountField = (error: TranslationPaths | ''): boolean => !isDistanceRequest && error === 'common.error.invalidAmount';

    const computeErrorMessage = (): string | undefined => {
        if (routeError) {
            return routeError;
        }
        // This runs ahead of the split branch below because splits render the same amount input, so the error duplicates the same way.
        if (isShownOnAmountField(formError)) {
            return undefined;
        }
        if (isTypeSplit && !shouldShowReadOnlySplits) {
            // The debounced value lags the live one after a fix, so it is checked too, or the amount error would flash into the footer for that moment (#96565).
            return debouncedFormError && !isShownOnAmountField(debouncedFormError) ? translate(debouncedFormError) : undefined;
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
        setConfirmError,
        clearConfirmError,
        shouldDisplayFieldError,
        isViolationFixed,
        errorMessage,
    };
}

export default useFormErrorManagement;
