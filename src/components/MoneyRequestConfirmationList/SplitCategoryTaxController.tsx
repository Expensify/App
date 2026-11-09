import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useRulesPrefetch from '@hooks/useRulesPrefetch';

import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {arePolicyRulesEnabled} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

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
 * Only the loading-to-loaded transition triggers this, so a tax the user chose before this screen was opened is
 * left alone.
 */
function SplitCategoryTaxController({transactionID, transaction, policy, policyCategories, isEditingSplitBill}: SplitCategoryTaxControllerProps) {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const {areRulesLoading} = useRulesPrefetch(isEditingSplitBill && arePolicyRulesEnabled(policy, policyCategories));
    const wereRulesLoading = usePrevious(areRulesLoading);
    const category = transaction?.category;

    useEffect(() => {
        if (!isEditingSplitBill || areRulesLoading || !wereRulesLoading || !category || !transaction) {
            return;
        }

        setDraftSplitTransaction(transactionID, transaction, {category}, getCurrencyDecimals, getCurrencySymbol, policy, undefined, undefined, rules);
    }, [areRulesLoading, wereRulesLoading, category, isEditingSplitBill, transactionID, transaction, policy, rules, getCurrencyDecimals, getCurrencySymbol]);

    return null;
}

SplitCategoryTaxController.displayName = 'SplitCategoryTaxController';

export default SplitCategoryTaxController;
export type {SplitCategoryTaxControllerProps};
