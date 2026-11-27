import {act, renderHook} from '@testing-library/react-native';

import useRootNavigationState from '@hooks/useRootNavigationState';
import useTrialPaymentReminder from '@hooks/useTrialPaymentReminder';

import {setNameValuePair} from '@userActions/User';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';

import type {NavigationState} from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@userActions/User', () => ({
    setNameValuePair: jest.fn(),
}));

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/** Free trial dates are stored in UTC without a timezone suffix, e.g. `2026-11-26 10:00:00` */
function toTrialDate(date: Date): string {
    return date.toISOString().replace('T', ' ').slice(0, 19);
}

function mockTopmostRootRoute(routeName: string) {
    jest.mocked(useRootNavigationState).mockImplementation((selector) =>
        selector(
            createMock<NavigationState>({
                routes: [{name: routeName, key: routeName}],
                index: 0,
            }),
        ),
    );
}

/** Sets up an owner of a paid workspace whose free trial started `trialAgeMs` ago and who has no billing card */
async function setUpTrialUser(accountID: number, trialAgeMs: number, onboarding: {hasCompletedGuidedSetupFlow?: boolean}) {
    const now = Date.now();
    const policy = {
        ...createRandomPolicy(accountID, CONST.POLICY.TYPE.TEAM),
        ownerAccountID: accountID,
        pendingAction: null,
    };
    await Onyx.multiSet({
        [ONYXKEYS.SESSION]: {accountID},
        [ONYXKEYS.HAS_LOADED_APP]: true,
        [ONYXKEYS.IS_LOADING_APP]: false,
        [ONYXKEYS.NVP_ONBOARDING]: onboarding,
        [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: toTrialDate(new Date(now - trialAgeMs)),
        [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: toTrialDate(new Date(now - trialAgeMs + 30 * DAY_MS)),
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
    await waitForBatchedUpdatesWithAct();
}

describe('useTrialPaymentReminder', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdatesWithAct();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockTopmostRootRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('stays hidden for the rest of the first session after a new user goes through onboarding', async () => {
        // Given a new user who is inside the onboarding flow and whose trial just started with the workspace they created
        mockTopmostRootRoute(NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
        await setUpTrialUser(ACCOUNT_ID, 10 * MINUTE_MS, {
            hasCompletedGuidedSetupFlow: false,
        });
        const {result} = renderHook(() => useTrialPaymentReminder());
        await waitForBatchedUpdatesWithAct();

        // Then the reminder does not show while onboarding is on screen, even though the 5 minute grace window has passed
        expect(result.current.isEligibleToShow).toBe(false);

        // When the user finishes onboarding and leaves the onboarding flow in the same session
        mockTopmostRootRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the reminder still stays hidden, because this is still the user's first session
        expect(result.current.isEligibleToShow).toBe(false);
        expect(result.current.currentVariation?.id).toBe('day1');
    });

    it('shows on day 1 in the second session after the first session ends', async () => {
        // Given a new user who went through onboarding in this runtime
        mockTopmostRootRoute(NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
        await setUpTrialUser(ACCOUNT_ID, 10 * MINUTE_MS, {
            hasCompletedGuidedSetupFlow: false,
        });
        const {result} = renderHook(() => useTrialPaymentReminder());
        await waitForBatchedUpdatesWithAct();
        expect(result.current.isEligibleToShow).toBe(false);

        // When the app reloads (the RAM-only record is cleared) and onboarding is now complete
        mockTopmostRootRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await Onyx.set(ONYXKEYS.RAM_ONLY_TRIAL_REMINDER_FIRST_SESSION_ACCOUNT_IDS, null);
        });
        await waitForBatchedUpdatesWithAct();

        // Then the existing day 1 reminder can show, even though it is still the same day
        expect(result.current.isEligibleToShow).toBe(true);
        expect(result.current.currentVariation?.id).toBe('day1');
    });

    it('shows right away for an existing user who completed onboarding', async () => {
        // Given an existing user whose onboarding is complete and whose trial started 3 days ago
        await setUpTrialUser(ACCOUNT_ID, 2 * DAY_MS + MINUTE_MS, {
            hasCompletedGuidedSetupFlow: true,
        });

        // When the hook mounts
        const {result} = renderHook(() => useTrialPaymentReminder());
        await waitForBatchedUpdatesWithAct();

        // Then the reminder shows as before, because existing users are never treated as first-session users
        expect(result.current.isEligibleToShow).toBe(true);
        expect(result.current.currentVariation?.id).toBe('day3');
    });

    it('shows right away for an old account with an empty onboarding NVP', async () => {
        // Given an old or OldDot-migrated account, whose onboarding NVP is empty and reads as completed
        await setUpTrialUser(ACCOUNT_ID, 2 * DAY_MS + MINUTE_MS, {});

        // When the hook mounts
        const {result} = renderHook(() => useTrialPaymentReminder());
        await waitForBatchedUpdatesWithAct();

        // Then the reminder shows as before
        expect(result.current.isEligibleToShow).toBe(true);
    });

    it('shows for a user with incomplete onboarding who never sees the onboarding flow', async () => {
        // Given an invited or skipped user who keeps hasCompletedGuidedSetupFlow false but never opens the onboarding flow
        await setUpTrialUser(ACCOUNT_ID, 10 * MINUTE_MS, {
            hasCompletedGuidedSetupFlow: false,
        });

        // When the hook mounts
        const {result} = renderHook(() => useTrialPaymentReminder());
        await waitForBatchedUpdatesWithAct();

        // Then the reminder shows as before, since checking the flag alone would hide it from them in every session
        expect(result.current.isEligibleToShow).toBe(true);
    });

    it('only suppresses the account that went through onboarding when switching accounts', async () => {
        // Given account A went through onboarding in this runtime
        mockTopmostRootRoute(NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
        await setUpTrialUser(ACCOUNT_ID, 10 * MINUTE_MS, {
            hasCompletedGuidedSetupFlow: false,
        });
        const {result} = renderHook(() => useTrialPaymentReminder());
        await waitForBatchedUpdatesWithAct();
        expect(result.current.isEligibleToShow).toBe(false);

        // When the user switches to account B, which completed onboarding long ago
        mockTopmostRootRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        await act(async () => {
            await setUpTrialUser(OTHER_ACCOUNT_ID, 2 * DAY_MS + MINUTE_MS, {
                hasCompletedGuidedSetupFlow: true,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then account B sees the reminder as before
        expect(result.current.isEligibleToShow).toBe(true);

        // When account A comes back in the same runtime
        await act(async () => {
            await setUpTrialUser(ACCOUNT_ID, 10 * MINUTE_MS, {
                hasCompletedGuidedSetupFlow: true,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then account A is still in its first session, so the reminder stays hidden
        expect(result.current.isEligibleToShow).toBe(false);
    });

    it('stays hidden after the hook remounts in the same runtime', async () => {
        // Given a new user who went through onboarding and then finished it
        mockTopmostRootRoute(NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
        await setUpTrialUser(ACCOUNT_ID, 10 * MINUTE_MS, {
            hasCompletedGuidedSetupFlow: false,
        });
        const {unmount} = renderHook(() => useTrialPaymentReminder());
        await waitForBatchedUpdatesWithAct();
        mockTopmostRootRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
        });

        // When the lazily loaded manager unmounts and mounts again without a reload
        unmount();
        const {result} = renderHook(() => useTrialPaymentReminder());
        await waitForBatchedUpdatesWithAct();

        // Then the record kept in Onyx still keeps the reminder hidden
        expect(result.current.isEligibleToShow).toBe(false);
    });

    it('never writes a dismissal for a first-session user', async () => {
        // Given a new user who went through onboarding in this runtime
        mockTopmostRootRoute(NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
        await setUpTrialUser(ACCOUNT_ID, 10 * MINUTE_MS, {
            hasCompletedGuidedSetupFlow: false,
        });

        // When the hook runs through onboarding and after it
        renderHook(() => useTrialPaymentReminder());
        await waitForBatchedUpdatesWithAct();
        mockTopmostRootRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then no dismissal is saved, so the day 1 window stays open for the second session
        expect(setNameValuePair).not.toHaveBeenCalled();
    });
});
