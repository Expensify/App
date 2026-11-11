import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useOnyx from '@hooks/useOnyx';
import useRulesPrefetch from '@hooks/useRulesPrefetch';

import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {arePolicyRulesEnabled} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useState} from 'react';

type SplitCategoryTaxControllerProps = {
    /** ID of the split whose draft the tax is written to */
    transactionID: string | undefined;

    /** The split draft the changes start from, or the saved transaction when no draft exists yet */
    transaction: OnyxEntry<Transaction>;

    /** The policy the category belongs to */
    policy: OnyxEntry<Policy>;

    /** Categories configured on `policy`, which decide whether the policy has rules to fetch at all */
    policyCategories: OnyxEntry<PolicyCategories>;

    /** Whether an existing split is being edited, which is the only case that writes to the split draft */
    isEditingSplitBill?: boolean;
};

/**
 * Side-effect-only component that resolves a split's category tax again once the rules arrive.
 *
 * A split's tax is resolved when its category is written, and a split draft gets no server response, so a
 * category picked before the rules land keeps whatever tax it was given without them. Replaying the category
 * puts it back through the same resolution the pick used, rather than resolving the rate a second way here.
 *
 * The work is keyed on which category has been resolved rather than on the rules arriving, because the category
 * can be picked on a screen covering this one, and a covered screen's effects do not run (see
 * `contributingGuides/ACTIVITY_SCREENS.md`). Keying it on the arrival would lose every pick made over there.
 * A category the screen opened with is recorded rather than replayed, so a tax the user chose for it earlier
 * survives.
 */
function SplitCategoryTaxController({transactionID, transaction, policy, policyCategories, isEditingSplitBill}: SplitCategoryTaxControllerProps) {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const {areRulesLoading} = useRulesPrefetch(isEditingSplitBill && arePolicyRulesEnabled(policy, policyCategories));
    // Wrapped, so that the category this opened on is told apart from not having recorded one yet.
    const [resolvedCategory, setResolvedCategory] = useState<{value: string | undefined}>();
    const category = transaction?.category;

    useEffect(() => {
        if (!isEditingSplitBill) {
            return;
        }

        if (!resolvedCategory) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- the category the screen opened on is only knowable on the first run, and replaying it would overwrite a tax picked for it earlier
            setResolvedCategory({value: category});
            return;
        }

        if (areRulesLoading || resolvedCategory.value === category) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect -- which category has been resolved is history, so it cannot be derived from the current render
        setResolvedCategory({value: category});

        if (!transaction) {
            return;
        }

        // Clearing the category is replayed too. Its tax falls back to the workspace default, and that fallback is
        // itself read from the rules, so without the rules the pick left the previous category's tax in place.
        setDraftSplitTransaction(transactionID, transaction, {category: category ?? ''}, getCurrencyDecimals, getCurrencySymbol, policy, undefined, undefined, rules);
    }, [areRulesLoading, resolvedCategory, category, isEditingSplitBill, transactionID, transaction, policy, rules, getCurrencyDecimals, getCurrencySymbol]);

    return null;
}

SplitCategoryTaxController.displayName = 'SplitCategoryTaxController';

export default SplitCategoryTaxController;
export type {SplitCategoryTaxControllerProps};
