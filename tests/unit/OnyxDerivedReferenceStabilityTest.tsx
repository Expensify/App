import {act, renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {TupleToUnion} from 'type-fest';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const GUIDE_ACCOUNT_ID = 8;
const MEMBER_ACCOUNT_ID = 1;
const NEW_GUIDE_ACCOUNT_ID = 9;
const NEW_MEMBER_ACCOUNT_ID = 2;

const PERSONAL_DETAILS: PersonalDetailsList = {
    [GUIDE_ACCOUNT_ID]: {accountID: GUIDE_ACCOUNT_ID, login: `guide@${CONST.EMAIL.GUIDES_DOMAIN}`, displayName: 'Guide'},
    [MEMBER_ACCOUNT_ID]: {accountID: MEMBER_ACCOUNT_ID, login: 'member@example.com', displayName: 'Member'},
};

const KEYS_READ_WITHOUT_SELECTOR = [ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS, ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP] as const;

function renderHookWithoutSelector<TKey extends TupleToUnion<typeof KEYS_READ_WITHOUT_SELECTOR>>(key: TKey) {
    let renderCount = 0;
    const hook = renderHook(() => {
        renderCount++;
        return useOnyx(key);
    });
    return {hook, getRenderCount: () => renderCount};
}

describe('OnyxDerived consumers without a selector on PERSONAL_DETAILS_LIST writes', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        await IntlStore.load(CONST.LOCALES.EN);
        await Onyx.set(ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING, false);
        await waitForBatchedUpdatesWithAct();
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it.each(KEYS_READ_WITHOUT_SELECTOR)('should keep the %s reference when an unrelated personal detail changes', async (key) => {
        // Given a component that reads the derived value without a selector, the way 10 App sites do
        const {hook, getRenderCount} = renderHookWithoutSelector(key);
        await waitForBatchedUpdatesWithAct();
        const [valueBefore] = hook.result.current;
        const rendersBefore = getRenderCount();

        // When a member renames themselves, which leaves both derived values with the same content
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[MEMBER_ACCOUNT_ID]: {displayName: 'Renamed member'}});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the engine's fresh but equal result must not reach the consumer as a new reference or a re-render
        expect(hook.result.current[0]).toBe(valueBefore);
        expect(getRenderCount()).toBe(rendersBefore);
    });

    it('should return new guide accountIDs when a guide is added', async () => {
        // Given a consumer of the guide accountIDs
        const {hook} = renderHookWithoutSelector(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
        await waitForBatchedUpdatesWithAct();
        const [valueBefore] = hook.result.current;

        // When a second guide's personal details arrive
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [NEW_GUIDE_ACCOUNT_ID]: {accountID: NEW_GUIDE_ACCOUNT_ID, login: `new.guide@${CONST.EMAIL.GUIDES_DOMAIN}`},
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the consumer sees the change, so the stability check above is not passing on a frozen value
        expect(hook.result.current[0]).not.toBe(valueBefore);
        expect(hook.result.current[0]).toEqual([GUIDE_ACCOUNT_ID, NEW_GUIDE_ACCOUNT_ID]);
    });

    it('should return a new login map when a login is added', async () => {
        // Given a consumer of the login to accountID map
        const {hook} = renderHookWithoutSelector(ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP);
        await waitForBatchedUpdatesWithAct();
        const [valueBefore] = hook.result.current;

        // When a new member's personal details arrive
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [NEW_MEMBER_ACCOUNT_ID]: {accountID: NEW_MEMBER_ACCOUNT_ID, login: 'new.member@example.com'},
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the consumer sees the new login
        expect(hook.result.current[0]).not.toBe(valueBefore);
        expect(hook.result.current[0]?.['new.member@example.com']).toBe(NEW_MEMBER_ACCOUNT_ID);
    });
});
