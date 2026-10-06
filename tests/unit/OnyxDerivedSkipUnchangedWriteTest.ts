import * as ActiveSpans from '@libs/telemetry/activeSpans';

import initOnyxDerivedValues from '@userActions/OnyxDerived';
import * as OnyxDerivedUtils from '@userActions/OnyxDerived/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const GUIDE_ACCOUNT_ID = 8;
const MEMBER_ACCOUNT_ID = 1;

const PERSONAL_DETAILS: PersonalDetailsList = {
    [GUIDE_ACCOUNT_ID]: {accountID: GUIDE_ACCOUNT_ID, login: `guide@${CONST.EMAIL.GUIDES_DOMAIN}`},
    [MEMBER_ACCOUNT_ID]: {accountID: MEMBER_ACCOUNT_ID, login: 'member@example.com', displayName: 'Member'},
};

function getGuideWrites(setDerivedValueSpy: jest.Spied<typeof OnyxDerivedUtils.setDerivedValue>) {
    return setDerivedValueSpy.mock.calls.filter(([key]) => key === ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
}

describe('OnyxDerived skips the write when compute returns the current value', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
        await waitForBatchedUpdates();
    });

    it('should not write to Onyx when compute returns the current value', async () => {
        // Given the guide accountIDs have been computed and stored
        const setDerivedValueSpy = jest.spyOn(OnyxDerivedUtils, 'setDerivedValue');

        // When a member is renamed, which recomputes the guides to the value already held
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[MEMBER_ACCOUNT_ID]: {displayName: 'Renamed member'}});
        await waitForBatchedUpdates();

        // Then nothing is written, so subscribers aren't notified and the value isn't rewritten to disk
        expect(getGuideWrites(setDerivedValueSpy)).toHaveLength(0);
        expect(await getOnyxValue(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS)).toEqual([GUIDE_ACCOUNT_ID]);
    });

    it('should still end the compute span when the write is skipped', async () => {
        // Given the compute span is observed
        const endSpanSpy = jest.spyOn(ActiveSpans, 'endSpan');

        // When a recompute returns the current value and skips the write
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[MEMBER_ACCOUNT_ID]: {displayName: 'Renamed member'}});
        await waitForBatchedUpdates();

        // Then the early return still goes through finally, so no compute span is left open
        expect(endSpanSpy).toHaveBeenCalledWith(`${CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE}_${ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS}`);
    });

    it('should rewrite the value after Onyx.clear', async () => {
        // Given the guide accountIDs are stored and Onyx is then cleared, as on sign-out
        await Onyx.clear();
        await waitForBatchedUpdates();
        const setDerivedValueSpy = jest.spyOn(OnyxDerivedUtils, 'setDerivedValue');

        // When the same personal details come back, as on signing in again
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
        await waitForBatchedUpdates();

        // Then the engine writes the value again instead of treating the pre-clear value as current
        expect(getGuideWrites(setDerivedValueSpy).length).toBeGreaterThan(0);
        expect(await getOnyxValue(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS)).toEqual([GUIDE_ACCOUNT_ID]);
    });
});
