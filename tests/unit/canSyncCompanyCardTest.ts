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

describe('canSyncCompanyCard', () => {
    it('allows syncing workspace feeds regardless of ownership or domain admin status', () => {
        expect(canSyncCompanyCard(createCard(OTHER_USER_ID), createFeedData(), CURRENT_USER_ID, false)).toBe(true);
        expect(canSyncCompanyCard(createCard(OTHER_USER_ID), undefined, CURRENT_USER_ID, false)).toBe(true);
    });

    it('denies syncing a domain feed card for a non-owner who is not a domain admin', () => {
        expect(canSyncCompanyCard(createCard(OTHER_USER_ID), createFeedData(123), CURRENT_USER_ID, false)).toBe(false);
        expect(canSyncCompanyCard(undefined, createFeedData(123), CURRENT_USER_ID, false)).toBe(false);
    });

    it('allows syncing a domain feed card for a domain admin', () => {
        expect(canSyncCompanyCard(createCard(OTHER_USER_ID), createFeedData(123), CURRENT_USER_ID, true)).toBe(true);
    });

    it('allows syncing a domain feed card for the card owner', () => {
        expect(canSyncCompanyCard(createCard(CURRENT_USER_ID), createFeedData(123), CURRENT_USER_ID, false)).toBe(true);
    });
});
