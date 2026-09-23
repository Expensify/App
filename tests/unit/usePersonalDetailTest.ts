import {act, renderHook} from '@testing-library/react-native';

import {usePersonalDetail} from '@hooks/usePersonalDetails';

import ONYXKEYS from '@src/ONYXKEYS';
import {loginSelector} from '@src/selectors/PersonalDetails';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ALICE = {accountID: 1, displayName: 'Alice', login: 'alice@test.com'};
const BOB = {accountID: 2, displayName: 'Bob', login: 'bob@test.com'};

describe('usePersonalDetail', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ALICE.accountID]: ALICE, [BOB.accountID]: BOB});
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns the whole record without a selector', () => {
        // Given personal details for Alice and Bob
        // When reading Alice without a selector
        const {result} = renderHook(() => usePersonalDetail(ALICE.accountID));

        // Then the hook returns her full record
        expect(result.current[0]).toEqual(ALICE);
    });

    it('returns the selected field with a selector', () => {
        // Given personal details for Alice and Bob
        // When reading Alice through the login selector
        const {result} = renderHook(() => usePersonalDetail(ALICE.accountID, loginSelector));

        // Then only her login comes back
        expect(result.current[0]).toBe(ALICE.login);
    });

    it('only re-renders when the selected field changes', async () => {
        // Given a hook reading Alice's login
        let renderCount = 0;
        renderHook(() => {
            renderCount++;
            return usePersonalDetail(ALICE.accountID, loginSelector);
        });
        const initialRenderCount = renderCount;

        // When another person and an unselected field of Alice change
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[BOB.accountID]: {displayName: 'Robert'}, [ALICE.accountID]: {displayName: 'Alicia'}});
        });
        await waitForBatchedUpdates();

        // Then the hook does not re-render, because the login it selects is unchanged
        expect(renderCount).toBe(initialRenderCount);

        // When Alice's login changes
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ALICE.accountID]: {login: 'alicia@test.com'}});
        });
        await waitForBatchedUpdates();

        // Then the hook re-renders with the new login
        expect(renderCount).toBe(initialRenderCount + 1);
    });
});
