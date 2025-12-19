import {useCallback} from 'react';
import {checkIfFeedConnectionIsBroken, getBankNameFromFeedName, getCompanyFeeds, getDomainOrWorkspaceAccountID, getFeedConnectionBrokenCard} from '@libs/CardUtils';
import {updateWorkspaceCompanyCard} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import type {CompanyCardFeedName} from '@src/types/onyx';
import useCardFeeds from './useCardFeeds';
import useCardsList from './useCardsList';
import usePolicy from './usePolicy';

export default function useUpdateFeedBrokenConnection({policyID, feed}: {policyID?: string; feed?: CompanyCardFeedName}) {
    const [cardsList] = useCardsList(feed);
    const policy = usePolicy(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const {cardList, ...cards} = cardsList ?? {};
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const domainOrWorkspaceAccountID = feed ? getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feed]) : CONST.DEFAULT_NUMBER_ID;
    const isFeedConnectionBroken = checkIfFeedConnectionIsBroken(cards);
    const brokenCard = getFeedConnectionBrokenCard(cards);
    const brokenCardId = brokenCard?.cardID?.toString();

    const updateBrokenConnection = useCallback(() => {
        if (!brokenCardId || !feed) {
            return;
        }
        updateWorkspaceCompanyCard(domainOrWorkspaceAccountID, brokenCardId, getBankNameFromFeedName(feed), brokenCard?.lastScrapeResult);
    }, [brokenCard?.lastScrapeResult, brokenCardId, domainOrWorkspaceAccountID, feed]);

    return {updateBrokenConnection, isFeedConnectionBroken};
}
