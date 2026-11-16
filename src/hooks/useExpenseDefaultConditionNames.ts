import {getCardDescription} from '@libs/CardUtils';
import type {ExpenseDefaultConditionNames} from '@libs/MerchantTypeRulesUtils';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useCardsLists from './useCardsLists';
import useLoadSearchCardData from './useLoadSearchCardData';
import useLocalize from './useLocalize';
import {useAllPersonalDetails} from './usePersonalDetails';
import useWorkspaceMembers from './useWorkspaceMembers';

/**
 * The names an expense default rule's member and card conditions read as.
 *
 * A rule stores account IDs and card IDs, which say nothing to an admin, and neither can be resolved from the
 * policy the way a category or a tax rate can. Everywhere a rule is listed reads them the same way from here.
 *
 * The workspace alone is not enough to resolve them. A rule keeps naming a member after they are removed, and a
 * rule copied to another workspace names members and cards that workspace never had, so both fall back to
 * everyone and every card this account can see before a row gives up and shows the stored ID.
 */
function useExpenseDefaultConditionNames(policy: OnyxEntry<Policy>): ExpenseDefaultConditionNames {
    const {translate} = useLocalize();
    const members = useWorkspaceMembers(policy);
    const [allPersonalDetails] = useAllPersonalDetails();
    // Onyx opens with only a subset of the cards, and nothing else on a page that merely lists rules asks for
    // the rest, so a card condition would otherwise read as an ID until a card page happened to be opened.
    useLoadSearchCardData();
    const [cardsLists] = useCardsLists();

    const submitters: Record<string, string> = {};
    for (const [accountID, details] of Object.entries(allPersonalDetails ?? {})) {
        const name = details?.displayName ?? details?.login;
        if (!name) {
            continue;
        }
        submitters[accountID] = name;
    }
    // The workspace's own members win, so a member reads the same here as everywhere else the workspace lists them.
    for (const {accountID, details} of members) {
        submitters[String(accountID)] = details.displayName ?? details.login ?? String(accountID);
    }

    const cards: Record<string, string> = {};
    for (const cardsList of Object.values(cardsLists ?? {})) {
        // `cardList` sits alongside the cards as the feed's plan metadata rather than as a card of its own.
        const {cardList, ...feedCards} = cardsList ?? {};
        for (const card of Object.values(feedCards)) {
            cards[String(card.cardID)] = getCardDescription(card, translate);
        }
    }

    return {submitters, cards};
}

export default useExpenseDefaultConditionNames;
