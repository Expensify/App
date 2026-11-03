import {getCardDescription} from '@libs/CardUtils';
import type {ExpenseDefaultConditionNames} from '@libs/MerchantTypeRulesUtils';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useLocalize from './useLocalize';
import usePolicyCards from './usePolicyCards';
import useWorkspaceMembers from './useWorkspaceMembers';

/**
 * The names an expense default rule's member and card conditions read as.
 *
 * A rule stores account IDs and card IDs, which say nothing to an admin, and neither can be resolved from the
 * policy the way a category or a tax rate can. Everywhere a rule is listed reads them the same way from here.
 */
function useExpenseDefaultConditionNames(policy: OnyxEntry<Policy>): ExpenseDefaultConditionNames {
    const {translate} = useLocalize();
    const members = useWorkspaceMembers(policy);
    const {cards: policyCards} = usePolicyCards(policy?.id);

    const submitters: Record<string, string> = {};
    for (const {accountID, details} of members) {
        submitters[String(accountID)] = details.displayName ?? details.login ?? String(accountID);
    }

    const cards: Record<string, string> = {};
    for (const card of policyCards) {
        cards[String(card.cardID)] = getCardDescription(card, translate);
    }

    return {submitters, cards};
}

export default useExpenseDefaultConditionNames;
