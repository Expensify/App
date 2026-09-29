/* eslint-disable @typescript-eslint/no-deprecated -- exercising the migration means reading SHOULD_USE_STAGING_SERVER */
import ReplaceShouldUseStagingServerWithActiveServer from '@libs/migrations/ReplaceShouldUseStagingServerWithActiveServer';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('ReplaceShouldUseStagingServerWithActiveServer', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it.each([
        [true, CONST.SERVER.STAGING],
        [false, CONST.SERVER.PRODUCTION],
    ])('maps shouldUseStagingServer=%s to %s and removes the legacy key', async (legacyValue, expected) => {
        await Onyx.set(ONYXKEYS.SHOULD_USE_STAGING_SERVER, legacyValue);
        await ReplaceShouldUseStagingServerWithActiveServer();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(ONYXKEYS.ACTIVE_SERVER)).toBe(expected);
        expect(await getOnyxValue(ONYXKEYS.SHOULD_USE_STAGING_SERVER)).toBeUndefined();
    });

    it('writes nothing when the legacy key is absent, so the env default still applies', async () => {
        await ReplaceShouldUseStagingServerWithActiveServer();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(ONYXKEYS.ACTIVE_SERVER)).toBeUndefined();
    });

    it('leaves an existing activeServer alone — a newer build already chose', async () => {
        await Onyx.multiSet({[ONYXKEYS.SHOULD_USE_STAGING_SERVER]: true, [ONYXKEYS.ACTIVE_SERVER]: CONST.SERVER.QA});
        await ReplaceShouldUseStagingServerWithActiveServer();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(ONYXKEYS.ACTIVE_SERVER)).toBe(CONST.SERVER.QA);
        expect(await getOnyxValue(ONYXKEYS.SHOULD_USE_STAGING_SERVER)).toBeUndefined();
    });
});
