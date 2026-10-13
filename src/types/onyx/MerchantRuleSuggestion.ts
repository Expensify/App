import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Expense field a merchant rule can govern */
type MerchantRuleSuggestionField = ValueOf<typeof CONST.MERCHANT_RULE_SUGGESTION_FIELDS>;

/**
 * The expense edits that can become a merchant rule, which drive the "Create a rule" callout.
 *
 * RAM-only, so the callout can appear again on the same expense next session.
 */
type MerchantRuleSuggestion = {
    /**
     * The expense currently offering, which is the one whose edit the server confirmed most recently.
     *
     * Set when a confirmation lands rather than when an edit is recorded. An edit that turns out to be a one-off would
     * otherwise take the offer away from an expense that had earned one and put nothing in its place.
     */
    transactionID?: string;

    /** Each recorded expense's transaction thread, where its callout can show */
    reportIDs?: Record<string, string>;

    /**
     * Fields edited so far, keyed by expense. Keying by expense lets `Onyx.merge` accumulate them without a read, and
     * keeps one expense's edits out of another's rule.
     */
    editedFields: Record<string, Partial<Record<MerchantRuleSuggestionField, boolean>>>;

    /**
     * Fields the server judged worth a rule, keyed the same way as `editedFields`. A field is recorded on the edit and
     * confirmed later, once the response says the same value has been given to the same merchant often enough. Only a
     * field present in both seeds the rule, so a one-off edit neither offers nor rides along on another field's offer.
     */
    confirmedFields?: Record<string, Partial<Record<MerchantRuleSuggestionField, boolean>>>;

    /**
     * Which levels of a multi-level tag were edited, keyed by expense then by level. Only these levels seed the rule,
     * so editing one level does not commit the rule to the levels the user left alone.
     */
    editedTagLevels?: Record<string, Record<string, boolean>>;

    /** Expenses dismissed this session. Kept alongside the current offer, so a dismissal survives later edits. */
    dismissedTransactionIDs?: string[];

    /**
     * The report the callout actually rendered in. Set by the callout itself, since the report showing an expense is
     * not always the one the edit was recorded against: a report holding a single expense shows the detail view too.
     *
     * Held as a report ID rather than a flag because several report screens stay mounted at once, in a split pane or
     * behind an RHP. Only the one that showed the offer should retire it on the way out.
     */
    seenInReportID?: string;

    /** Whether the offer was seen and left. Unlike dismissing, editing the expense again offers afresh. */
    isRetired?: boolean;
};

export default MerchantRuleSuggestion;
export type {MerchantRuleSuggestionField};
