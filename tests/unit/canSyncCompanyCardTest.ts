import {canSyncCompanyCard} from '@libs/CardUtils';

import type {Card} from '@src/types/onyx';
import type {CardFeedData} from '@src/types/onyx/CardFeeds';

const CURRENT_USER_ID = 1;
const OTHER_USER_ID = 2;

function createFeedData(domainID?: number): CardFeedData {
    return {domainID} as CardFeedData;
}

function createCard(accountID: number): Card {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {accountID} as Card;
}

const WORKSPACE_ACCOUNT_ID = 999;
const DOMAIN_ID = 123;

describe('canSyncCompanyCard', () => {
    it('allows syncing workspace feeds regardless of ownership or domain admin status', () => {
        // Given a card owned by someone else on a feed without a domain
        const card = createCard(OTHER_USER_ID);

        // When checking whether a non-owner, non-domain-admin can sync it
        const canSync = canSyncCompanyCard(card, createFeedData(), WORKSPACE_ACCOUNT_ID, CURRENT_USER_ID, false);

        // Then syncing is allowed
        expect(canSync).toBe(true);
    });

    it('denies syncing while the feed data is unknown, even for a domain admin or the card owner', () => {
        // Given feed data that has not loaded yet
        const feedData = undefined;

        // When checking whether a non-owner, an admin and an owner can sync
        const forNonOwner = canSyncCompanyCard(createCard(OTHER_USER_ID), feedData, WORKSPACE_ACCOUNT_ID, CURRENT_USER_ID, false);
        const forAdmin = canSyncCompanyCard(createCard(OTHER_USER_ID), feedData, WORKSPACE_ACCOUNT_ID, CURRENT_USER_ID, true);
        const forOwner = canSyncCompanyCard(createCard(CURRENT_USER_ID), feedData, WORKSPACE_ACCOUNT_ID, CURRENT_USER_ID, false);

        // Then syncing is denied until the feed is known
        expect(forNonOwner).toBe(false);
        expect(forAdmin).toBe(false);
        expect(forOwner).toBe(false);
    });

    it('allows syncing a workspace feed whose domainID equals the workspace account ID', () => {
        // Given a workspace feed that carries the workspace account ID as its domainID
        const feedData = createFeedData(WORKSPACE_ACCOUNT_ID);

        // When a non-owner who is not a domain admin checks if they can sync
        const canSync = canSyncCompanyCard(createCard(OTHER_USER_ID), feedData, WORKSPACE_ACCOUNT_ID, CURRENT_USER_ID, false);

        // Then syncing is allowed
        expect(canSync).toBe(true);
    });

    it('denies syncing a domain feed card for a non-owner who is not a domain admin', () => {
        // Given a real domain feed
        const feedData = createFeedData(DOMAIN_ID);

        // When a non-owner who is not a domain admin checks if they can sync
        const forOtherCard = canSyncCompanyCard(createCard(OTHER_USER_ID), feedData, WORKSPACE_ACCOUNT_ID, CURRENT_USER_ID, false);
        const forMissingCard = canSyncCompanyCard(undefined, feedData, WORKSPACE_ACCOUNT_ID, CURRENT_USER_ID, false);

        // Then syncing is denied
        expect(forOtherCard).toBe(false);
        expect(forMissingCard).toBe(false);
    });

    it('allows syncing a domain feed card for a domain admin', () => {
        // Given a real domain feed
        const feedData = createFeedData(DOMAIN_ID);

        // When a domain admin checks if they can sync someone else's card
        const canSync = canSyncCompanyCard(createCard(OTHER_USER_ID), feedData, WORKSPACE_ACCOUNT_ID, CURRENT_USER_ID, true);

        // Then syncing is allowed
        expect(canSync).toBe(true);
    });

    it('allows syncing a domain feed card for the card owner', () => {
        // Given a real domain feed and a card owned by the current user
        const feedData = createFeedData(DOMAIN_ID);

        // When the owner, who is not a domain admin, checks if they can sync
        const canSync = canSyncCompanyCard(createCard(CURRENT_USER_ID), feedData, WORKSPACE_ACCOUNT_ID, CURRENT_USER_ID, false);

        // Then syncing is allowed
        expect(canSync).toBe(true);
    });
});
