import {canSyncCompanyCard, getCardFeedWithDomainID, getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';

import {updateWorkspaceCompanyCard} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isAdminSelector} from '@src/selectors/Domain';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

import {useCallback} from 'react';

import useCardFeedErrors from './useCardFeedErrors';
import useCardFeeds from './useCardFeeds';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

export default function useUpdateFeedBrokenConnection({policyID, feed}: {policyID?: string; feed?: CompanyCardFeedWithDomainID}) {
    const policy = usePolicy(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const domainOrWorkspaceAccountID = feed ? getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feed]) : CONST.DEFAULT_NUMBER_ID;
    const currentUserAccountID = useCurrentUserPersonalDetails().accountID;
    const domainID = feed ? companyFeeds[feed]?.domainID : undefined;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainID}`);
    const isDomainAdmin = isAdminSelector(currentUserAccountID)(domain);
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
            if (!canSyncCompanyCard(card, companyFeeds[feed], currentUserAccountID, isDomainAdmin)) {
                continue;
            }
            updateWorkspaceCompanyCard(domainOrWorkspaceAccountID, brokenCardId, bankName, card.lastScrapeResult);
        }
    }, [cardsWithBrokenFeedConnection, companyFeeds, currentUserAccountID, domainOrWorkspaceAccountID, feed, isDomainAdmin]);

    return {updateBrokenConnection, isFeedConnectionBroken};
}
