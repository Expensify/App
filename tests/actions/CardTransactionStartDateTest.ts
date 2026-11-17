import {updateAssignedCardTransactionStartDate} from '@libs/actions/Card';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CARD_ID = '123';
const NEW_START_DATE = '2026-10-13';

OnyxUpdateManager();
describe('actions/Card transaction start date updates', () => {
    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockFetch.succeed();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it.each([undefined, '', '2026-10-01'])('restores the previous start date after failure (%s)', async (oldStartDate) => {
        // Given a card whose saved date must survive a failed edit, including an absent date
        await Onyx.set(ONYXKEYS.CARD_LIST, {[CARD_ID]: {cardID: Number(CARD_ID), scrapeMinDate: oldStartDate}});
        mockFetch.pause();
        mockFetch.fail();

        // When a new custom date is saved before the server responds
        updateAssignedCardTransactionStartDate(CARD_ID, NEW_START_DATE, oldStartDate);
        await waitForBatchedUpdates();

        // Then the optimistic date is pending until the failed response rolls it back
        let card = (await getOnyxValue(ONYXKEYS.CARD_LIST))?.[CARD_ID];
        expect(card?.scrapeMinDate).toBe(NEW_START_DATE);
        expect(card?.pendingFields?.scrapeMinDate).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

        await mockFetch.resume();
        await waitForBatchedUpdates();

        card = (await getOnyxValue(ONYXKEYS.CARD_LIST))?.[CARD_ID];
        expect(card?.scrapeMinDate).toBe(oldStartDate);
        expect(card?.pendingFields?.scrapeMinDate).toBeUndefined();
        expect(Object.keys(card?.errorFields?.scrapeMinDate ?? {})).toHaveLength(1);
    });

    it('preserves the new date after a successful update', async () => {
        // Given a card without a saved minimum date
        await Onyx.set(ONYXKEYS.CARD_LIST, {[CARD_ID]: {cardID: Number(CARD_ID)}});

        // When the server accepts a new custom date
        updateAssignedCardTransactionStartDate(CARD_ID, NEW_START_DATE);
        await waitForBatchedUpdates();

        // Then the confirmed date remains without pending or error feedback
        const card = (await getOnyxValue(ONYXKEYS.CARD_LIST))?.[CARD_ID];
        expect(card?.scrapeMinDate).toBe(NEW_START_DATE);
        expect(card?.pendingFields?.scrapeMinDate).toBeUndefined();
        expect(card?.errorFields?.scrapeMinDate).toBeUndefined();
    });
});
