import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Expense field a merchant rule can govern */
type MerchantRuleSuggestionField = ValueOf<typeof CONST.MERCHANT_RULE_SUGGESTION_FIELDS>;

/**
 * The expense edits that can become a merchant rule, which drive the "Create a rule" callout.
 *
 * Everything the user does lives here, and RAM-only, so the callout can appear again on the same expense next
 * session. What the server says about these edits is held apart, in `MerchantRuleSuggestionConfirmation`.
 */
type MerchantRuleSuggestion = {
    /** The expense currently offering, which is the one edited most recently */
    transactionID?: string;

    /** Each recorded expense's transaction thread, where its callout can show */
    reportIDs?: Record<string, string>;

    /**
     * Fields edited so far, keyed by expense. Keying by expense lets `Onyx.merge` accumulate them without a read, and
     * keeps one expense's edits out of another's rule.
     */
    editedFields: Record<string, Partial<Record<MerchantRuleSuggestionField, boolean>>>;

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

    /**
     * The expense whose offer the callout showed, which is the one leaving that report retires.
     *
     * Recorded alongside the report rather than read back from the confirmation on the way out, because a verdict for
     * another expense can land while this one's callout is on screen. Retiring whatever is offering by then would end
     * an offer the user never saw.
     */
    seenTransactionID?: string;

    /**
     * Expenses whose offer was seen and left. Unlike dismissing, editing the expense again offers afresh.
     *
     * Keyed by expense rather than held as one flag, so leaving one expense's offer does not silence the next one
     * before it has been made.
     */
    retiredTransactionIDs?: Record<string, boolean>;
};

/**
 * Auth's verdict on one expense's recorded edits, keyed by field. A field reads true once the same value has been
 * given to the same merchant often enough for a rule to be worth offering, and false once it has not.
 *
 * Written by Auth into `suggestNewRuleCreation_<transactionID>`, so it outlives the session while the edits it answers
 * do not. That costs nothing: a verdict alone shows no callout, since only a field present in both halves can seed a
 * rule.
 */
type MerchantRuleSuggestionConfirmation = Partial<Record<MerchantRuleSuggestionField, boolean>>;

export default MerchantRuleSuggestion;
export type {MerchantRuleSuggestionConfirmation, MerchantRuleSuggestionField};
