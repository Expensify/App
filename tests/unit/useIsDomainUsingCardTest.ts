import {renderHook} from '@testing-library/react-native';

import useIsDomainUsingCard from '@hooks/useIsDomainUsingCard';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const domainAccountID = 424242;
const expensifyCardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}` as const;
const domainMemberKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}` as const;

function buildCardFeeds(companyCards: NonNullable<NonNullable<CardFeeds['settings']>['companyCards']>): CardFeeds {
    return {settings: {companyCards}} as CardFeeds;
}

describe('useIsDomainUsingCard', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns false when the domain has neither an Expensify Card feed nor a company card feed', () => {
        // Given a domain with no card data at all
        // When we render the hook
        const {result} = renderHook(() => useIsDomainUsingCard(domainAccountID));

        // Then the setting is not eligible
        expect(result.current.isDomainUsingCard).toBe(false);
    });

    it('returns true when the domain has an Expensify Card feed', async () => {
        // Given the domain has Expensify Card settings present
        await Onyx.set(expensifyCardSettingsKey, {isEnabled: true, paymentBankAccountID: 1});

        // When we render the hook
        const {result} = renderHook(() => useIsDomainUsingCard(domainAccountID));

        // Then the setting is eligible
        expect(result.current.isDomainUsingCard).toBe(true);
    });

    it('returns true when the domain has only a company card feed', async () => {
        // Given the domain has a company card feed but no Expensify Card feed
        await Onyx.set(domainMemberKey, buildCardFeeds({[CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {liabilityType: 'personal'}}));

        // When we render the hook
        const {result} = renderHook(() => useIsDomainUsingCard(domainAccountID));

        // Then the setting is eligible
        expect(result.current.isDomainUsingCard).toBe(true);
    });

    it('returns true for a connected direct feed with no assigned cards yet', async () => {
        // Given a connected direct feed (Chase) with no oAuthAccountDetails and no assigned cards
        await Onyx.set(domainMemberKey, buildCardFeeds({[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]: {liabilityType: 'personal'}}));

        // When we render the hook
        const {result} = renderHook(() => useIsDomainUsingCard(domainAccountID));

        // Then the setting is still eligible - eligibility does not require assigned cards
        expect(result.current.isDomainUsingCard).toBe(true);
    });

    it('returns true when the domain has both an Expensify Card feed and a company card feed', async () => {
        // Given the domain has both an Expensify Card feed and a company card feed
        await Onyx.set(expensifyCardSettingsKey, {isEnabled: true, paymentBankAccountID: 1});
        await Onyx.set(domainMemberKey, buildCardFeeds({[CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {liabilityType: 'personal'}}));

        // When we render the hook
        const {result} = renderHook(() => useIsDomainUsingCard(domainAccountID));

        // Then the setting is eligible
        expect(result.current.isDomainUsingCard).toBe(true);
    });

    it('returns false when the only company card entry is the Expensify Card bank placeholder', async () => {
        // Given the company cards contain only the Expensify Card bank placeholder
        await Onyx.set(domainMemberKey, buildCardFeeds({[CONST.EXPENSIFY_CARD.BANK]: {liabilityType: 'personal'}}));

        // When we render the hook
        const {result} = renderHook(() => useIsDomainUsingCard(domainAccountID));

        // Then it is not treated as a company card feed
        expect(result.current.isDomainUsingCard).toBe(false);
    });

    it('returns false when the only company card feed is pending deletion', async () => {
        // Given the domain's only company card feed is pending deletion
        await Onyx.set(domainMemberKey, buildCardFeeds({[CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}));

        // When we render the hook
        const {result} = renderHook(() => useIsDomainUsingCard(domainAccountID));

        // Then the pending-delete feed does not make the setting eligible
        expect(result.current.isDomainUsingCard).toBe(false);
    });

    it('returns false when the only company card feed is pending setup', async () => {
        // Given the domain's only company card feed is still pending setup
        await Onyx.set(domainMemberKey, buildCardFeeds({[CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {pending: true}}));

        // When we render the hook
        const {result} = renderHook(() => useIsDomainUsingCard(domainAccountID));

        // Then the pending feed does not make the setting eligible
        expect(result.current.isDomainUsingCard).toBe(false);
    });
});
