import type {ConfirmationFieldErrors, SiblingFieldErrors} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import getConfirmationFieldErrors, {getSiblingFieldErrors, hasFieldErrors} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';

import {useCurrencyListActions} from '@hooks/useCurrencyList';

import {isValidPerDiemExpenseAmount} from '@libs/actions/IOU/PerDiem';
import {isCategoryMissing} from '@libs/CategoryUtils';
import {validateAmount} from '@libs/MoneyRequestUtils';
import type {getTagLists as getTagListsFn} from '@libs/PolicyUtils';
import {canSubmitPerDiemExpenseFromWorkspace} from '@libs/PolicyUtils';
import {hasEnabledTags, hasMatchingTag} from '@libs/TagsOptionsListUtils';
import {isValidTimeExpenseAmount} from '@libs/TimeTrackingUtils';
import {areRequiredFieldsEmpty, getTag, hasTaxRateWithMatchingValue} from '@libs/TransactionUtils';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import type {OnyxEntry} from 'react-native-onyx';

type ValidationResult =
    | {
          errorKey: TranslationPaths;
          shouldSetDidConfirmSplit?: boolean;
      }
    | {
          isFieldError: true;
          shouldSetDidConfirmSplit?: boolean;
      }
    | {errorKey: null};

type UseConfirmationValidationResult = {
    /** Returns the first check that blocks confirmation, `{errorKey: null}` when none does, or null when validation can't run yet */
    validate: (paymentType?: PaymentMethodType) => ValidationResult | null;

    /** The errors the amount, merchant, date, tax amount and attendees fields would show now. `validate` blocks on the same map. */
    fieldErrors: ConfirmationFieldErrors;

    /** The first other receipt of a multi-scan with a field error. It is only looked for once the receipt on screen has none, since that one is fixed first. */
    siblingFieldErrors: SiblingFieldErrors | undefined;
};

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

    /** The report owner, who counts as the attendee while none were picked */
    reportOwnerAsAttendee: Attendee | undefined;

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

    currentUserPersonalDetails: CurrentUserPersonalDetails;

    /** Whether we are editing an existing split bill */
    isEditingSplitBill: boolean | undefined;

    /** Whether the merchant field is required for this flow */
    isMerchantRequired: boolean | undefined;

    /** Whether the tax section is enabled for this policy */
    shouldShowTax: boolean;

    /** Whether the transaction is a distance request */
    isDistanceRequest: boolean;

    /** Whether the distance request route is still pending */
    isDistanceRequestWithPendingRoute: boolean;

    /** Whether the transaction is a per-diem request */
    isPerDiemRequest: boolean;

    /** Whether a tracked expense is being moved into a workspace (submit/categorize/share from the self-DM) */
    isMovingTransactionFromTrackExpense: boolean;

    /** Whether the transaction is a time-tracking request */
    isTimeRequest: boolean;

    /** Truthy when the route to the confirmation page has a known error */
    routeError: string | null | undefined;

    /** Whether this surface offers manual entry of the amount / merchant / date. False for test receipts and moved tracked expenses. */
    canEnterScanFieldsManually: boolean;

    /** Whether the expense goes to a workspace chat, the only destination where a manually entered Scan needs a merchant */
    isPolicyExpenseChat: boolean;

    /** The other receipts of a multi-scan, which Create submits together with this one */
    siblingTransactions?: OnyxTypes.Transaction[];

    /** Whether the confirmation fields are read-only (date is not inline-editable) */
    isReadOnly: boolean;

    /** Whether the date field is shown for this flow (mirrors the footer's date visibility) */
    shouldShowDate: boolean;

    /** Whether the inline tax amount field is currently left empty (new manual expense flow) */
    isTaxAmountEmpty: boolean;
};

/**
 * Runs the set of pure validation checks for the Money Request confirmation
 * flow and returns a translation key describing the first failure, a field
 * error signal when a field that shows its own error blocks, or a success
 * signal. The amount, merchant, date, tax amount and attendees checks come from
 * `getConfirmationFieldErrors`, whose map is returned too so those fields render
 * exactly the errors that block confirmation.
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
    reportOwnerAsAttendee,
    policy,
    policyTags,
    policyTagLists,
    policyCategories,
    selectedParticipants,
    currentUserPersonalDetails,
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
}: UseConfirmationValidationParams): UseConfirmationValidationResult {
    const {getCurrencyDecimals} = useCurrencyListActions();
    const selectedParticipantsCount = selectedParticipants.length;
    const fieldErrorParams = {
        iouType,
        canEnterScanFieldsManually,
        isPolicyExpenseChat,
        shouldShowDate,
        isReadOnly,
        isEditingSplitBill,
        isMerchantRequired,
        isDistanceRequest,
        isTimeRequest,
        currentUserAccountID: currentUserPersonalDetails.accountID,
        policy,
        policyCategories,
        shouldShowTax,
        reportOwnerAsAttendee,
        currentUserLogin: currentUserPersonalDetails.email ?? currentUserPersonalDetails.login,
        getCurrencyDecimals,
    };
    const fieldErrors = getConfirmationFieldErrors(transaction, {...fieldErrorParams, iouAmount, iouMerchant, isTaxAmountEmpty});
    const siblingFieldErrors = !hasFieldErrors(fieldErrors) ? getSiblingFieldErrors(siblingTransactions, {...fieldErrorParams, participants: transaction?.participants}) : undefined;
    const validateReceiptOnScreen = (paymentType?: PaymentMethodType): ValidationResult | null => {
        if (!!routeError || !transactionID) {
            return null;
        }

        if (selectedParticipantsCount === 0) {
            return {errorKey: 'iou.error.noParticipantSelected'};
        }

        if (hasFieldErrors(fieldErrors)) {
            // A field error returns before the edited split's required-fields check below, so the split is marked as confirmed here too, or its missing-field errors only show on a second Save.
            if (isEditingSplitBill && areRequiredFieldsEmpty(transaction, transactionReport)) {
                return {isFieldError: true, shouldSetDidConfirmSplit: true};
            }
            return {isFieldError: true};
        }

        if (iouCategory.length > CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
            return {errorKey: 'iou.error.invalidCategoryLength'};
        }

        const isCategoryBeingCreated = policyCategories?.[iouCategory]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

        // The 'Uncategorized'/'none' placeholder means no category, so treat it as missing (not out of policy) here, mirroring
        // isCategoryMissing/ViolationsUtils. Otherwise it wrongly blocks confirmation when the policy lacks that literal category.
        if (iouCategory && !isCategoryMissing(iouCategory) && policyCategories && !policyCategories[iouCategory]?.enabled && !isCategoryBeingCreated) {
            return {errorKey: 'violations.categoryOutOfPolicy'};
        }

        const transactionTag = getTag(transaction);
        if (transactionTag.length > CONST.API_TRANSACTION_TAG_MAX_LENGTH) {
            return {errorKey: 'iou.error.invalidTagLength'};
        }

        if (transactionTag && hasEnabledTags(policyTagLists) && !hasMatchingTag(policyTags, transactionTag)) {
            return {errorKey: 'violations.tagOutOfPolicy'};
        }

        if (shouldShowTax && !!transaction?.taxCode && !hasTaxRateWithMatchingValue(policy, transaction)) {
            return {errorKey: 'violations.taxOutOfPolicy'};
        }

        if (isPerDiemRequest && (transaction?.comment?.customUnit?.subRates ?? []).length === 0) {
            return {errorKey: 'iou.error.invalidSubrateLength'};
        }

        // Per diem is a Control-plan feature, so block moving a tracked per diem expense into a workspace that can't
        // process it (e.g. a Submit workspace created via "Submit to my employer"). Without this guard the submission
        // falls through to a request the backend can't resolve, leaving the destination report stuck loading.
        if (isPerDiemRequest && isMovingTransactionFromTrackExpense && !canSubmitPerDiemExpenseFromWorkspace(policy)) {
            return {errorKey: 'iou.moveExpensesError'};
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

            return {errorKey: null};
        }

        // PAY branch: require payment method
        if (!paymentType) {
            return null;
        }
        return {errorKey: null};
    };

    // Create submits every receipt, so another receipt's field errors block it too, but only once the receipt on screen passes all its checks.
    const validate = (paymentType?: PaymentMethodType): ValidationResult | null => {
        const result = validateReceiptOnScreen(paymentType);
        if (siblingFieldErrors && result && 'errorKey' in result && result.errorKey === null) {
            return {isFieldError: true};
        }
        return result;
    };

    return {validate, fieldErrors, siblingFieldErrors};
}

export default useConfirmationValidation;
export type {UseConfirmationValidationParams, ValidationResult};
