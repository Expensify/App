import initOnyxDerivedValues from '@userActions/OnyxDerived';
import * as OnyxDerivedUtils from '@userActions/OnyxDerived/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const GUIDE_ACCOUNT_ID = 8;

describe('OnyxDerived with a value restored from disk', () => {
    it('should not rewrite a restored value when compute returns it unchanged', async () => {
        // Given the guide accountIDs and their personal details are already stored, as after an app restart
        Onyx.init({keys: ONYXKEYS});
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[GUIDE_ACCOUNT_ID]: {accountID: GUIDE_ACCOUNT_ID, login: `guide@${CONST.EMAIL.GUIDES_DOMAIN}`}},
            [ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS]: [GUIDE_ACCOUNT_ID],
        });
        await waitForBatchedUpdates();
        const setDerivedValueSpy = jest.spyOn(OnyxDerivedUtils, 'setDerivedValue');

        // When the engine starts and runs its first compute from scratch
        initOnyxDerivedValues();
        await waitForBatchedUpdates();

        // Then the restored value is kept as it is, without another write
        const guideWrites = setDerivedValueSpy.mock.calls.filter(([key]) => key === ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
        expect(guideWrites).toHaveLength(0);
        expect(await getOnyxValue(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS)).toEqual([GUIDE_ACCOUNT_ID]);
    });
});
