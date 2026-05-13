import type {ValueOf} from 'type-fest';
import type * as OnyxTypes from '@src/types/onyx';

type TagVisibilityEntry = {
    /** Whether this tag list should be displayed */
    shouldShow: boolean;
    /** Whether the tag for this list is required to submit */
    isTagRequired: boolean;
};

type TagEntry = {
    /** Name of the tag list */
    name: string;
    /** Position in `policyTagLists` (used for navigation + previous-visibility lookups) */
    index: number;
    /** Whether the tag for this list is required to submit */
    isTagRequired: boolean;
};

type ComputeFieldVisibilityParams = {
    /** Whether smart-scan-driven fields (amount, merchant, date) are visible */
    shouldShowSmartScanFields: boolean;
    /** Whether the amount field should be displayed when smart-scan fields are visible */
    shouldShowAmountField: boolean;
    /** Whether the active transaction is a distance request (drives Rate visibility) */
    isDistanceRequest: boolean;
    /** Whether the merchant field should be displayed */
    shouldShowMerchant: boolean;
    /** Whether the time-request fields should be displayed */
    shouldShowTimeRequestFields: boolean;
    /** Whether the categories field should be displayed */
    shouldShowCategories: boolean;
    /** Whether the categories field is required (drives above-show-more placement) */
    isCategoryRequired: boolean;
    /** Whether the date field should be displayed */
    shouldShowDate: boolean;
    /** Per-tag-list visibility (parallel to policy `policyTagLists` order) */
    tagVisibility: TagVisibilityEntry[];
    /** Tag lists configured on the policy */
    policyTagLists: Array<ValueOf<OnyxTypes.PolicyTagLists>>;
    /** Whether the tax field should be displayed */
    shouldShowTax: boolean;
    /** Whether the attendees field should be displayed */
    shouldShowAttendees: boolean;
    /** Whether the reimbursable toggle should be displayed */
    shouldShowReimbursable: boolean;
    /** Whether the billable toggle should be displayed */
    shouldShowBillable: boolean;
    /** Whether the surface is in a policy-expense chat (drives Report mount) */
    isPolicyExpenseChat: boolean;
};

/**
 * Resolved visibility flags for every confirmation field — single source of truth shared by
 * the orchestrator (to decide whether the show-more button is needed) and the field groups
 * (to gate their JSX). Defining each field's rule exactly once here makes it impossible
 * for a new optional field to render without the show-more button picking it up.
 */
type FieldVisibility = {
    // Above show-more (rendered in compact mode too, when the field's `shouldShow` is true).
    /** Whether the Description field should render (always true; included for symmetry) */
    description: boolean;
    /** Whether the Distance field should render (above show-more for distance requests) */
    distance: boolean;
    /** Whether the (required) Category field should render above show-more */
    categoryRequired: boolean;
    /** Required tag lists that should render above show-more */
    tagsRequired: TagEntry[];

    // Below show-more (suppressed in compact mode; their presence drives the show-more button).
    /** Whether the Amount field should render below show-more */
    amount: boolean;
    /** Whether the Rate field should render below show-more (distance requests only) */
    rate: boolean;
    /** Whether the Merchant field should render below show-more */
    merchant: boolean;
    /** Whether the Time fields should render below show-more */
    time: boolean;
    /** Whether the (optional) Category field should render below show-more */
    categoryOptional: boolean;
    /** Whether the Date field should render below show-more */
    date: boolean;
    /** Optional tag lists that should render below show-more */
    tagsOptional: TagEntry[];
    /** Whether the Tax field should render below show-more */
    tax: boolean;
    /** Whether the Attendees field should render below show-more */
    attendees: boolean;
    /** Whether the Reimbursable / Billable toggles should render below show-more */
    toggles: boolean;
    /** Whether the Report field should render below show-more */
    report: boolean;
};

function computeFieldVisibility({
    shouldShowSmartScanFields,
    shouldShowAmountField,
    isDistanceRequest,
    shouldShowMerchant,
    shouldShowTimeRequestFields,
    shouldShowCategories,
    isCategoryRequired,
    shouldShowDate,
    tagVisibility,
    policyTagLists,
    shouldShowTax,
    shouldShowAttendees,
    shouldShowReimbursable,
    shouldShowBillable,
    isPolicyExpenseChat,
}: ComputeFieldVisibilityParams): FieldVisibility {
    const tagsRequired: TagEntry[] = [];
    const tagsOptional: TagEntry[] = [];
    for (const [index, {name}] of policyTagLists.entries()) {
        const item = tagVisibility.at(index);
        if (!item?.shouldShow) {
            continue;
        }
        const entry: TagEntry = {name, index, isTagRequired: item.isTagRequired};
        (item.isTagRequired ? tagsRequired : tagsOptional).push(entry);
    }

    return {
        description: true,
        distance: isDistanceRequest,
        categoryRequired: shouldShowCategories && isCategoryRequired,
        tagsRequired,

        amount: shouldShowSmartScanFields && shouldShowAmountField,
        rate: isDistanceRequest,
        merchant: shouldShowMerchant,
        time: shouldShowTimeRequestFields,
        categoryOptional: shouldShowCategories && !isCategoryRequired,
        date: shouldShowDate,
        tagsOptional,
        tax: shouldShowTax,
        attendees: shouldShowAttendees,
        toggles: shouldShowReimbursable || shouldShowBillable,
        report: isPolicyExpenseChat,
    };
}

/**
 * Returns true iff at least one below-show-more field would render. Derived from the same
 * `FieldVisibility` the field groups consume, so the show-more button cannot drift from the
 * fields actually rendered below it.
 */
function hasBelowShowMore(flags: FieldVisibility): boolean {
    return (
        flags.amount ||
        flags.rate ||
        flags.merchant ||
        flags.time ||
        flags.categoryOptional ||
        flags.date ||
        flags.tagsOptional.length > 0 ||
        flags.tax ||
        flags.attendees ||
        flags.toggles ||
        flags.report
    );
}

export default computeFieldVisibility;
export {hasBelowShowMore};
export type {FieldVisibility, TagEntry, TagVisibilityEntry};
