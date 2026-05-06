import type {OnyxEntry} from 'react-native-onyx';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {isValidPerDiemExpenseAmount} from '@libs/actions/IOU/PerDiem';
import {getIsMissingAttendeesViolation} from '@libs/AttendeeUtils';
import {validateAmount} from '@libs/MoneyRequestUtils';
import type {getTagLists as getTagListsFn} from '@libs/PolicyUtils';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {hasEnabledTags, hasMatchingTag} from '@libs/TagsOptionsListUtils';
import {isValidTimeExpenseAmount} from '@libs/TimeTrackingUtils';
import {areRequiredFieldsEmpty, getTag, hasTaxRateWithMatchingValue, isMerchantMissing} from '@libs/TransactionUtils';
import {isValidInputLength} from '@libs/ValidationUtils';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

type ValidationResult = {errorKey: TranslationPaths; shouldSetDidConfirmSplit?: boolean} | {errorKey: null};

type UseConfirmationValidationParams = {
    /** Transaction being validated */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Report the IOU is being created on */
    transactionReport: OnyxEntry<OnyxTypes.Report>;

    /** Transaction ID, used to scope tag/violation lookups */
    transactionID: string | undefined;

    /** IOU type being confirmed (submit / split / track / pay / invoice) */
    iouType: IOUType;

    /** Total IOU amount being validated */
    iouAmount: number;

    /** Current merchant value entered for the IOU */
    iouMerchant: string | undefined;

    /** Currently selected category */
    iouCategory: string;

    /** Currency the IOU is being created in */
    iouCurrencyCode: string;

    /** Currently selected attendees */
    iouAttendees: Attendee[];

    /** Policy the IOU belongs to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy tag lists, used for tag validation */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** Pre-resolved tag lists for the policy (output of getTagLists) */
    policyTagLists: ReturnType<typeof getTagListsFn>;

    /** Policy categories, used for category validation */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Participants selected for this IOU */
    selectedParticipants: Participant[];

    /** Personal details of the current user */
    currentUserPersonalDetails: CurrentUserPersonalDetails;

    /** Whether we are editing an existing split bill */
    isEditingSplitBill: boolean | undefined;

    /** Whether the merchant field is required for this flow */
    isMerchantRequired: boolean | undefined;

    /** Whether the merchant field is currently empty / partial */
    isMerchantEmpty: boolean;

    /** Whether per-field errors should be shown */
    shouldDisplayFieldError: boolean;

    /** Whether the tax section is enabled for this policy */
    shouldShowTax: boolean;

    /** Whether the transaction is a distance request */
    isDistanceRequest: boolean;

    /** Whether the distance request route is still pending */
    isDistanceRequestWithPendingRoute: boolean;

    /** Whether the transaction is a per-diem request */
    isPerDiemRequest: boolean;

    /** Whether the transaction is a time-tracking request */
    isTimeRequest: boolean;

    /** Whether the new manual expense flow beta is enabled */
    isNewManualExpenseFlowEnabled: boolean;

    /** Truthy when the route to the confirmation page has a known error */
    routeError: string | null | undefined;
};

/**
 * Runs the set of pure validation checks for the Money Request confirmation
 * flow and returns either a translation key describing the first failure, or
 * a success signal.
 *
 * Side effects (setting form error, firing onConfirm / onSendMoney,
 * navigating to the company info route, showing the delegate-no-access modal)
 * stay in the caller.
 *
 * The Invoice -> Company Info routing check stays in the caller as well:
 * it is a routing decision that happens before validation runs, so the
 * caller guards the call to `validate()` with its own
 * `iouType === INVOICE && !hasInvoicingDetails(policy)` check.
 */
function useConfirmationValidation({
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
    isMerchantEmpty,
    shouldDisplayFieldError,
    shouldShowTax,
    isDistanceRequest,
    isDistanceRequestWithPendingRoute,
    isPerDiemRequest,
    isTimeRequest,
    isNewManualExpenseFlowEnabled,
    routeError,
}: UseConfirmationValidationParams): {validate: (paymentType?: PaymentMethodType) => ValidationResult | null} {
    const {getCurrencyDecimals} = useCurrencyListActions();
    const selectedParticipantsCount = selectedParticipants.length;
    const validate = (paymentType?: PaymentMethodType): ValidationResult | null => {
        if (!!routeError || !transactionID) {
            return null;
        }

        if (selectedParticipantsCount === 0) {
            return {errorKey: 'iou.error.noParticipantSelected'};
        }

        const amountForValidation = iouAmount;
        const isAmountMissingForManualFlow = amountForValidation === null || amountForValidation === undefined;

        if (iouType !== CONST.IOU.TYPE.PAY && isNewManualExpenseFlowEnabled && isAmountMissingForManualFlow) {
            return {errorKey: 'common.error.invalidAmount'};
        }

        const merchantValue = iouMerchant ?? '';
        const {isValid: isMerchantLengthValid} = isValidInputLength(merchantValue, CONST.MERCHANT_NAME_MAX_BYTES);

        if (!isMerchantLengthValid) {
            return {errorKey: 'iou.error.invalidMerchant'};
        }

        if (!isEditingSplitBill && isMerchantRequired && (isMerchantEmpty || (shouldDisplayFieldError && isMerchantMissing(transaction)))) {
            return {errorKey: 'iou.error.invalidMerchant'};
        }

        if (iouCategory.length > CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
            return {errorKey: 'iou.error.invalidCategoryLength'};
        }

        if (iouCategory && policyCategories && !policyCategories[iouCategory]?.enabled) {
            return {errorKey: 'violations.categoryOutOfPolicy'};
        }

        const transactionTag = getTag(transaction);
        if (transactionTag.length > CONST.API_TRANSACTION_TAG_MAX_LENGTH) {
            return {errorKey: 'iou.error.invalidTagLength'};
        }

        if (transactionTag && hasEnabledTags(policyTagLists) && !hasMatchingTag(policyTags, transactionTag)) {
            return {errorKey: 'violations.tagOutOfPolicy'};
        }

        // Since invoices are not expense reports that need attendee tracking, this validation should not apply to invoices
        const isMissingAttendeesViolation =
            iouType !== CONST.IOU.TYPE.INVOICE &&
            getIsMissingAttendeesViolation(
                policyCategories,
                iouCategory,
                iouAttendees,
                currentUserPersonalDetails,
                isAttendeeTrackingEnabled(policy),
                policy?.type === CONST.POLICY.TYPE.CORPORATE,
            );
        if (isMissingAttendeesViolation) {
            return {errorKey: 'violations.missingAttendees'};
        }

        if (shouldShowTax && !!transaction?.taxCode && !hasTaxRateWithMatchingValue(policy, transaction)) {
            return {errorKey: 'violations.taxOutOfPolicy'};
        }

        if (isPerDiemRequest && (transaction?.comment?.customUnit?.subRates ?? []).length === 0) {
            return {errorKey: 'iou.error.invalidSubrateLength'};
        }

        if (iouType !== CONST.IOU.TYPE.PAY) {
            const decimals = getCurrencyDecimals(iouCurrencyCode);
            if (isDistanceRequest && !isDistanceRequestWithPendingRoute && !validateAmount(String(iouAmount), decimals, CONST.IOU.DISTANCE_REQUEST_AMOUNT_MAX_LENGTH)) {
                return {errorKey: 'common.error.invalidAmount'};
            }

            if (isDistanceRequest && Math.abs(iouAmount) > CONST.IOU.MAX_SAFE_AMOUNT) {
                return {errorKey: 'iou.error.distanceAmountTooLarge'};
            }

            if (isTimeRequest && !isValidTimeExpenseAmount(iouAmount, decimals)) {
                return {errorKey: 'iou.timeTracking.amountTooLargeError'};
            }

            if (isPerDiemRequest && !isValidPerDiemExpenseAmount(transaction?.comment?.customUnit ?? {}, decimals)) {
                return {errorKey: 'iou.error.invalidQuantity'};
            }

            if (isEditingSplitBill && areRequiredFieldsEmpty(transaction, transactionReport)) {
                return {errorKey: 'iou.error.genericSmartscanFailureMessage', shouldSetDidConfirmSplit: true};
            }

            if (isEditingSplitBill && iouAmount === 0) {
                return {errorKey: 'iou.error.invalidAmount'};
            }

            return {errorKey: null};
        }

        // PAY branch: require payment method
        if (!paymentType) {
            return null;
        }
        return {errorKey: null};
    };

    return {validate};
}

export default useConfirmationValidation;
export type {ValidationResult};
