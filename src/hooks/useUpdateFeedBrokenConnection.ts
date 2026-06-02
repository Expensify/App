import {useCallback} from 'react';
import {getCardFeedWithDomainID, getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import {updateWorkspaceCompanyCard} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import useCardFeedErrors from './useCardFeedErrors';
import useCardFeeds from './useCardFeeds';
import usePolicy from './usePolicy';

export default function useUpdateFeedBrokenConnection({policyID, feed}: {policyID?: string; feed?: CompanyCardFeedWithDomainID}) {
    const policy = usePolicy(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const domainOrWorkspaceAccountID = feed ? getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feed]) : CONST.DEFAULT_NUMBER_ID;
    const {cardFeedErrors, cardsWithBrokenFeedConnection} = useCardFeedErrors();

    const isFeedConnectionBroken = feed ? !!cardFeedErrors[feed]?.isFeedConnectionBroken : false;

    const updateBrokenConnection = useCallback(() => {
        if (!feed) {
            return;
        }
        const bankName = getCompanyCardFeed(feed);
        for (const [brokenCardId, card] of Object.entries(cardsWithBrokenFeedConnection)) {
            if (!card.fundID || getCardFeedWithDomainID(card.bank, card.fundID) !== feed) {
                continue;
            }
            updateWorkspaceCompanyCard(domainOrWorkspaceAccountID, brokenCardId, bankName, card.lastScrapeResult);
        }
    }, [cardsWithBrokenFeedConnection, domainOrWorkspaceAccountID, feed]);

    return {updateBrokenConnection, isFeedConnectionBroken};
}
