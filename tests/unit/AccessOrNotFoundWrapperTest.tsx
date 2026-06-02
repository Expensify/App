import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Navigation from '@libs/Navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type Policy from '@src/types/onyx/Policy';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'A1B2C3D4E5F6';
const LOGIN = 'me@expensify.com';
const REMOVAL_DELAY = CONST.WORKSPACE_INACCESSIBLE_SCREEN_REMOVAL_DELAY;

jest.mock('@libs/Navigation/Navigation', () => ({
    removeScreenFromNavigationState: jest.fn(),
    goBack: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback?.()),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof import('@react-navigation/native')>('@react-navigation/native'),
    useIsFocused: () => false,
}));

jest.mock('@hooks/useIsWorkspacesTabFocused', () => ({__esModule: true, default: () => false}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@hooks/usePreferredPolicy', () => ({__esModule: true, default: () => ({isRestrictedToPreferredPolicy: false})}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({login: 'me@expensify.com'})}));
jest.mock('@libs/actions/Policy/Policy', () => ({openWorkspace: jest.fn()}));

const accessiblePolicy = {id: POLICY_ID, name: 'Workspace', type: CONST.POLICY.TYPE.TEAM, owner: LOGIN, role: CONST.POLICY.ROLE.ADMIN} as Policy;
// Same workspace mid-sync: a full policy replacement that momentarily carries no resolvable role for the current user.
const inaccessiblePolicy = {id: POLICY_ID, name: 'Workspace', type: CONST.POLICY.TYPE.TEAM, owner: LOGIN, employeeList: {}} as Policy;

// We intercept only the wrapper's debounce timer (identified by its delay) so the removal can be fired deterministically,
// while every other setTimeout/clearTimeout (e.g. Onyx internals) keeps using the real implementation.
const FAKE_TIMER_ID = 987654 as unknown as ReturnType<typeof setTimeout>;
let removalCallback: (() => void) | undefined;
let scheduledRemovals = 0;
let clearedRemovals = 0;

function setPolicy(policy: Policy | null) {
    return act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await waitForBatchedUpdatesWithAct();
    });
}

function renderWrapper() {
    return render(
        <OnyxListItemProvider>
            <AccessOrNotFoundWrapper policyID={POLICY_ID}>
                <View testID="wrapper-children" />
            </AccessOrNotFoundWrapper>
        </OnyxListItemProvider>,
    );
}

describe('AccessOrNotFoundWrapper', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        removalCallback = undefined;
        scheduledRemovals = 0;
        clearedRemovals = 0;

        const realSetTimeout = global.setTimeout;
        jest.spyOn(global, 'setTimeout').mockImplementation(((callback: () => void, delay?: number, ...args: unknown[]) => {
            if (delay === REMOVAL_DELAY) {
                scheduledRemovals++;
                removalCallback = callback;
                return FAKE_TIMER_ID;
            }
            return realSetTimeout(callback, delay, ...args);
        }) as typeof setTimeout);

        const realClearTimeout = global.clearTimeout;
        jest.spyOn(global, 'clearTimeout').mockImplementation(((id?: ReturnType<typeof setTimeout>) => {
            if (id === FAKE_TIMER_ID) {
                clearedRemovals++;
                removalCallback = undefined;
                return;
            }
            return realClearTimeout(id);
        }) as typeof clearTimeout);

        await Onyx.clear();
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('does not schedule a teardown while the policy is accessible', async () => {
        await setPolicy(accessiblePolicy);
        renderWrapper();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('wrapper-children')).toBeTruthy();
        expect(scheduledRemovals).toBe(0);
        expect(Navigation.removeScreenFromNavigationState).not.toHaveBeenCalled();
    });

    it('tears down the workspace screen when the policy stays inaccessible (genuine removal)', async () => {
        await setPolicy(inaccessiblePolicy);
        renderWrapper();
        await waitForBatchedUpdatesWithAct();

        // The teardown is deferred, not immediate.
        expect(scheduledRemovals).toBe(1);
        expect(Navigation.removeScreenFromNavigationState).not.toHaveBeenCalled();

        // Fire the debounce timer: the policy is still inaccessible, so the screen is removed.
        act(() => removalCallback?.());

        expect(Navigation.removeScreenFromNavigationState).toHaveBeenCalledTimes(1);
        expect(Navigation.removeScreenFromNavigationState).toHaveBeenCalledWith(SCREENS.WORKSPACE.INITIAL);
    });

    it('cancels the teardown when the policy becomes accessible again before the timer fires (transient sync state)', async () => {
        await setPolicy(inaccessiblePolicy);
        renderWrapper();
        await waitForBatchedUpdatesWithAct();

        expect(scheduledRemovals).toBe(1);

        // A follow-up policy update restores the current user's role before the timer fires.
        await setPolicy(accessiblePolicy);

        expect(clearedRemovals).toBe(1);
        expect(removalCallback).toBeUndefined();
        expect(Navigation.removeScreenFromNavigationState).not.toHaveBeenCalled();
    });
});
