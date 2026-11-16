import {getCardDescriptionForSearchTable} from '@libs/CardUtils';
import type {ExpenseDefaultConditionNames} from '@libs/MerchantTypeRulesUtils';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
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
    const {translate, formatPhoneNumber} = useLocalize();
    const members = useWorkspaceMembers(policy);
    const [allPersonalDetails] = useAllPersonalDetails();
    // Onyx opens with only a subset of the cards, and nothing else on a page that merely lists rules asks for
    // the rest, so a card condition would otherwise read as an ID until a card page happened to be opened.
    useLoadSearchCardData();
    const [cardsLists] = useCardsLists();

    const submitters: Record<string, string> = {};
    for (const [accountID, details] of Object.entries(allPersonalDetails ?? {})) {
        // A member invited by phone is named by their SMS login, which reads as an address rather than a number
        // until it is formatted.
        const name = temporaryGetDisplayNameOrDefault({
            passedPersonalDetails: details,
            defaultValue: '',
            shouldFallbackToHidden: false,
            translate,
            formatPhoneNumber,
        });
        if (!name) {
            continue;
        }
        submitters[accountID] = name;
    }
    // The workspace's own members win, so a member reads the same here as everywhere else the workspace lists them.
    for (const {accountID, details} of members) {
        submitters[String(accountID)] = temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber});
    }

    const cards: Record<string, string> = {};
    for (const cardsList of Object.values(cardsLists ?? {})) {
        // `cardList` sits alongside the cards as the feed's plan metadata rather than as a card of its own.
        const {cardList, ...feedCards} = cardsList ?? {};
        for (const card of Object.values(feedCards)) {
            // Two cards of the same feed read alike until the cardholder names them apart, which is how the spend
            // rules name a card too.
            const cardholderName = temporaryGetDisplayNameOrDefault({
                passedPersonalDetails: allPersonalDetails?.[card.accountID ?? CONST.DEFAULT_NUMBER_ID],
                defaultValue: '',
                shouldFallbackToHidden: false,
                translate,
                formatPhoneNumber,
            });
            cards[String(card.cardID)] = getCardDescriptionForSearchTable(card, translate, cardholderName || undefined);
        }
    }

    return {submitters, cards};
}

export default useExpenseDefaultConditionNames;
