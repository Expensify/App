import RemoveNonArrayFrequentlyUsedEmojis from '@libs/migrations/RemoveNonArrayFrequentlyUsedEmojis';

import ONYXKEYS from '@src/ONYXKEYS';
import type {FrequentlyUsedEmoji} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const EMOJI_LIST: FrequentlyUsedEmoji[] = [{code: '👍', name: '+1', hexcode: '1f44d', count: 3, lastUpdatedAt: 1792000000}];

describe('RemoveNonArrayFrequentlyUsedEmojis', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it('removes an object so the next emoji list from the server is stored', async () => {
        // Given a device that stored an empty object for the emoji list, which makes Onyx reject every later list
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the test stores the wrong type on purpose, to match what those devices hold
        await Onyx.set(ONYXKEYS.FREQUENTLY_USED_EMOJIS, {} as FrequentlyUsedEmoji[]);

        // When the migration runs and the server then merges the user's emoji list, as OpenApp does
        await RemoveNonArrayFrequentlyUsedEmojis();
        await Onyx.merge(ONYXKEYS.FREQUENTLY_USED_EMOJIS, EMOJI_LIST);
        await waitForBatchedUpdates();

        // Then the list is stored, because the object no longer blocks the merge
        expect(await getOnyxValue(ONYXKEYS.FREQUENTLY_USED_EMOJIS)).toEqual(EMOJI_LIST);
    });

    it('keeps a stored emoji list', async () => {
        // Given a device that already stores the emoji list as a list
        await Onyx.set(ONYXKEYS.FREQUENTLY_USED_EMOJIS, EMOJI_LIST);

        // When the migration runs
        await RemoveNonArrayFrequentlyUsedEmojis();
        await waitForBatchedUpdates();

        // Then the list stays, so the user keeps their frequently used emojis
        expect(await getOnyxValue(ONYXKEYS.FREQUENTLY_USED_EMOJIS)).toEqual(EMOJI_LIST);
    });

    it('writes nothing when no emoji list is stored', async () => {
        // Given a device with no emoji list
        // When the migration runs
        await RemoveNonArrayFrequentlyUsedEmojis();
        await waitForBatchedUpdates();

        // Then the key is still missing, because a missing value never blocks the server list
        expect(await getOnyxValue(ONYXKEYS.FREQUENTLY_USED_EMOJIS)).toBeUndefined();
    });
});
