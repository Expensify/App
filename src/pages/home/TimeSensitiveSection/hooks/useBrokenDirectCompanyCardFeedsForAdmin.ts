import {useMemo} from 'react';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import {getCardFeedWithDomainID, isDirectFeed} from '@libs/CardUtils';
import type {Policy} from '@src/types/onyx';

type BrokenCompanyCardConnection = {
    /** The policy ID associated with this connection */
    policyID: string;

    /** The policy name associated with this connection */
    policyName: string;

    /** A representative card ID on this feed, used to render FixCompanyCardConnection */
    cardID: string;

    /** feedNameWithDomainID for this broken direct feed */
    feedKey: string;
};

/**
 * Returns at most one broken company card connection per direct (OAuth/Plaid) feed for workspaces
 * where the current user is an admin. Commercial feeds (vcf/cdf/etc.) are excluded because they
 * are file-based and not user-fixable via bank login.
 */
function useBrokenDirectCompanyCardFeedsForAdmin(adminPolicies: Policy[] | undefined): BrokenCompanyCardConnection[] {
    const {cardsWithBrokenFeedConnection} = useCardFeedErrors();

    return useMemo(() => {
        if (!cardsWithBrokenFeedConnection || !adminPolicies) {
            return [];
        }

        const brokenCompanyCardConnectionsByFeed = new Map<string, BrokenCompanyCardConnection>();

        for (const card of Object.values(cardsWithBrokenFeedConnection)) {
            if (!card?.fundID) {
                continue;
            }

            // Only direct OAuth/Plaid feeds are user-fixable; commercial feeds (vcf/cdf/etc.) are file-based
            if (!isDirectFeed(card.bank)) {
                continue;
            }

            const cardFundID = Number(card.fundID);
            const matchingPolicy = adminPolicies.find((policy) => policy.policyAccountID === cardFundID);

            if (!matchingPolicy) {
                continue;
            }

            const feedKey = getCardFeedWithDomainID(card.bank, card.fundID);
            if (brokenCompanyCardConnectionsByFeed.has(feedKey)) {
                continue;
            }

            brokenCompanyCardConnectionsByFeed.set(feedKey, {
                policyID: matchingPolicy.id,
                policyName: matchingPolicy.name,
                cardID: String(card.cardID),
                feedKey,
            });
        }

        return Array.from(brokenCompanyCardConnectionsByFeed.values());
    }, [adminPolicies, cardsWithBrokenFeedConnection]);
}

export default useBrokenDirectCompanyCardFeedsForAdmin;
export type {BrokenCompanyCardConnection};
