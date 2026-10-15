import {canSyncCompanyCard, getCardFeedWithDomainID, getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';

import {updateWorkspaceCompanyCard} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

import {useCallback} from 'react';

import useCardFeedErrors from './useCardFeedErrors';
import useCardFeeds from './useCardFeeds';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsDomainAdmin from './useIsDomainAdmin';
import usePolicy from './usePolicy';

export default function useUpdateFeedBrokenConnection({policyID, feed}: {policyID?: string; feed?: CompanyCardFeedWithDomainID}) {
    const policy = usePolicy(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const domainOrWorkspaceAccountID = feed ? getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feed]) : CONST.DEFAULT_NUMBER_ID;
    const currentUserAccountID = useCurrentUserPersonalDetails().accountID;
    const domainID = feed ? companyFeeds[feed]?.domainID : undefined;
    const isDomainAdmin = useIsDomainAdmin(domainID);
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
            if (!canSyncCompanyCard(card, companyFeeds[feed], workspaceAccountID, currentUserAccountID, isDomainAdmin)) {
                continue;
            }
            updateWorkspaceCompanyCard(domainOrWorkspaceAccountID, brokenCardId, bankName, card.lastScrapeResult);
        }
    }, [cardsWithBrokenFeedConnection, companyFeeds, workspaceAccountID, currentUserAccountID, domainOrWorkspaceAccountID, feed, isDomainAdmin]);

    return {updateBrokenConnection, isFeedConnectionBroken};
}
