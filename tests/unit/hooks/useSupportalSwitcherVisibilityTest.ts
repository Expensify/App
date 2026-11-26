import {act, renderHook} from '@testing-library/react-native';

import useSupportalSwitcherVisibility from '@components/Navigation/SupportalSwitcher/useSupportalSwitcherVisibility';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

describe('useSupportalSwitcherVisibility', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'agent@example.com'});
    });

    afterEach(async () => {
        // The hook is still mounted when the data is cleared, so the update has to land inside act.
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('is not a support agent without the support login permission or a supportal session', async () => {
        // Given an ordinary account
        await Onyx.merge(ONYXKEYS.ACCOUNT, {canSupportLogin: false});

        // When the hook runs
        const {result} = renderHook(() => useSupportalSwitcherVisibility());
        await waitForBatchedUpdatesWithAct();

        // Then nothing is offered
        expect(result.current.isSupportAgent).toBe(false);
    });

    it('is a support agent when the account can support login', async () => {
        // Given an account with the support login permission
        await Onyx.merge(ONYXKEYS.ACCOUNT, {canSupportLogin: true});

        // When the hook runs
        const {result} = renderHook(() => useSupportalSwitcherVisibility());
        await waitForBatchedUpdatesWithAct();

        // Then the switcher is offered
        expect(result.current.isSupportAgent).toBe(true);
    });

    it('stays a support agent during a supportal session, where the account is the customer and cannot support login', async () => {
        // Given an agent signed into a customer account, so canSupportLogin is false
        await Onyx.merge(ONYXKEYS.ACCOUNT, {canSupportLogin: false});
        await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});

        // When the hook runs
        const {result} = renderHook(() => useSupportalSwitcherVisibility());
        await waitForBatchedUpdatesWithAct();

        // Then the agent can still switch to another account
        expect(result.current.isSupportAgent).toBe(true);
    });

    it('shows and hides the switcher', async () => {
        // Given a support agent
        await Onyx.merge(ONYXKEYS.ACCOUNT, {canSupportLogin: true});
        const {result} = renderHook(() => useSupportalSwitcherVisibility());
        await waitForBatchedUpdatesWithAct();
        expect(result.current.isSwitcherVisible).toBe(false);

        // When the switcher is shown
        act(() => result.current.showSwitcher());

        // Then it is visible
        expect(result.current.isSwitcherVisible).toBe(true);

        // When it is hidden
        act(() => result.current.hideSwitcher());

        // Then it is not
        expect(result.current.isSwitcherVisible).toBe(false);
    });

    it('stops reporting the switcher as visible once the permission is lost, so a bar cannot hold its peek for a popover that is gone', async () => {
        // Given a support agent with the switcher open
        await Onyx.merge(ONYXKEYS.ACCOUNT, {canSupportLogin: true});
        const {result} = renderHook(() => useSupportalSwitcherVisibility());
        await waitForBatchedUpdatesWithAct();
        act(() => result.current.showSwitcher());
        expect(result.current.isSwitcherVisible).toBe(true);

        // When the permission is revoked mid-session
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {canSupportLogin: false});
        });

        // Then the switcher no longer counts as visible
        expect(result.current.isSupportAgent).toBe(false);
        expect(result.current.isSwitcherVisible).toBe(false);
    });
});
