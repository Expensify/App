import {setFeedReimbursable} from '@libs/actions/CompanyCards';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = 'A1B2C3D4E5F60718';
const DOMAIN_ACCOUNT_ID = 1234567;
const FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
const domainMemberKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}` as const;

async function getFeedSettings() {
    const domainMember = await getOnyxValue(domainMemberKey);
    return domainMember?.settings?.companyCards?.[FEED];
}

OnyxUpdateManager();
describe('actions/CompanyCards setFeedReimbursable', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(async () => {
        mockFetch.succeed();
        await Onyx.clear();
        await Onyx.set(domainMemberKey, {settings: {companyCards: {[FEED]: {forceReimbursable: CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_YES}}}});
        await waitForBatchedUpdates();
    });

    it('sends the selected value for the feed-owning account', () => {
        // Given an API write that we can inspect
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        // When an admin selects a new reimbursable setting
        setFeedReimbursable(POLICY_ID, FEED, DOMAIN_ACCOUNT_ID, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_YES, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_YES);

        // Then the selected value is sent for the account that owns the feed
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_FEED_REIMBURSABLE,
            {policyID: POLICY_ID, bankName: FEED, domainAccountID: DOMAIN_ACCOUNT_ID, forceReimbursable: CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_YES},
            expect.anything(),
        );
        apiWriteSpy.mockRestore();
    });

    it('shows the new value as pending until the request completes', async () => {
        // Given a request that hasn't completed yet
        mockFetch.pause();

        // When an admin selects a new reimbursable setting
        setFeedReimbursable(POLICY_ID, FEED, DOMAIN_ACCOUNT_ID, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_YES, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_YES);
        await waitForBatchedUpdates();

        // Then the new value shows right away, marked as pending
        let feedSettings = await getFeedSettings();
        expect(feedSettings?.forceReimbursable).toBe(CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_YES);
        expect(feedSettings?.pendingFields?.forceReimbursable).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

        // When the request succeeds
        await mockFetch.resume();
        await waitForBatchedUpdates();

        // Then the new value stays and is no longer pending
        feedSettings = await getFeedSettings();
        expect(feedSettings?.forceReimbursable).toBe(CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_YES);
        expect(feedSettings?.pendingFields?.forceReimbursable).toBeUndefined();
        expect(feedSettings?.errorFields?.forceReimbursable).toBeUndefined();
    });

    it('restores the previous value and shows an error when the request fails', async () => {
        // Given a request that will fail
        mockFetch.fail();

        // When an admin selects a new reimbursable setting
        setFeedReimbursable(POLICY_ID, FEED, DOMAIN_ACCOUNT_ID, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_YES, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_YES);
        await waitForBatchedUpdates();

        // Then the previous value is restored, no longer pending, with an error the admin can see
        const feedSettings = await getFeedSettings();
        expect(feedSettings?.forceReimbursable).toBe(CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_YES);
        expect(feedSettings?.pendingFields?.forceReimbursable).toBeUndefined();
        expect(Object.keys(feedSettings?.errorFields?.forceReimbursable ?? {})).toHaveLength(1);
    });

    it('removes the optimistic value when the feed had no previous setting and the request fails', async () => {
        // Given a feed without a stored setting and a request that will fail
        await Onyx.set(domainMemberKey, {settings: {companyCards: {[FEED]: {}}}});
        mockFetch.fail();

        // When an admin selects a new reimbursable setting
        setFeedReimbursable(POLICY_ID, FEED, DOMAIN_ACCOUNT_ID, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_NO, undefined);
        await waitForBatchedUpdates();

        // Then the feed goes back to having no stored setting
        const feedSettings = await getFeedSettings();
        expect(feedSettings?.forceReimbursable).toBeUndefined();
        expect(Object.keys(feedSettings?.errorFields?.forceReimbursable ?? {})).toHaveLength(1);
    });
});
