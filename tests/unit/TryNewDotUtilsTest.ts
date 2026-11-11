import {getIsTryNewDotLoading, hasBeenInNewDot30Days, isOldAppRedirectBlocked, shouldBlockOldAppExit, shouldHideOldAppRedirect, shouldUseOldApp} from '@src/libs/TryNewDotUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TryNewDot} from '@src/types/onyx';

import {subDays} from 'date-fns';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

Onyx.init({keys: ONYXKEYS});

function getTryNewDot(): Promise<TryNewDot | null> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.NVP_TRY_NEW_DOT,
            callback: (value) => {
                connectionID.unsubscribe();
                resolve(value ?? null);
            },
        });
    });
}

describe('TryNewDotUtils', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    describe('getIsTryNewDotLoading', () => {
        it.each([true, undefined])('waits for OpenApp when storage is loaded but app loading is %s', (isLoadingApp) => {
            // Given a cleared NVP whose storage metadata has already loaded
            const isLoadingFromStorage = false;

            // When OpenApp has not explicitly finished loading
            const isLoading = getIsTryNewDotLoading(undefined, isLoadingFromStorage, isLoadingApp);

            // Then Classic eligibility remains unresolved
            expect(isLoading).toBe(true);
        });

        it('allows an absent NVP after OpenApp finishes', () => {
            // Given OpenApp completed without returning an NVP
            const isLoadingFromStorage = false;

            // When eligibility loading is checked
            const isLoading = getIsTryNewDotLoading(undefined, isLoadingFromStorage, false);

            // Then the missing optional NVP does not keep Classic hidden forever
            expect(isLoading).toBe(false);
        });

        it('waits for storage metadata even when app loading has finished', () => {
            // Given the NVP storage subscription is not initialized yet
            const isLoadingFromStorage = true;

            // When OpenApp is already finished
            const isLoading = getIsTryNewDotLoading(undefined, isLoadingFromStorage, false);

            // Then eligibility cannot be read until storage is loaded
            expect(isLoading).toBe(true);
        });

        it('does not wait for OpenApp when the NVP is already available', () => {
            // Given a resolved NVP while other OpenApp data is loading
            const tryNewDot = createMock<TryNewDot>({isLockedToNewApp: false});

            // When eligibility loading is checked
            const isLoading = getIsTryNewDotLoading(tryNewDot, false, true);

            // Then the available NVP can determine Classic eligibility immediately
            expect(isLoading).toBe(false);
        });
    });

    it('keeps mobile-locked HybridApp users in NewApp', () => {
        const tryNewDot = createMock<TryNewDot>({
            isLockedToNewApp: true,
            classicRedirect: {
                dismissed: true,
            },
        });

        expect(shouldUseOldApp(tryNewDot)).toBe(false);
    });

    it('does not apply the mobile-only lock to web Classic gating', () => {
        const tryNewDot = {
            isLockedToNewApp: true,
        } as TryNewDot;

        expect(isOldAppRedirectBlocked(tryNewDot, false)).toBe(false);
        expect(isOldAppRedirectBlocked(tryNewDot, true)).toBe(true);
    });

    it('hides HybridApp Classic entry points while tryNewDot is still loading', () => {
        expect(shouldHideOldAppRedirect(undefined, true, true)).toBe(true);
    });

    it('does not hide web Classic entry points just because tryNewDot is still loading', () => {
        expect(shouldHideOldAppRedirect(undefined, true, false)).toBe(false);
    });

    it('blocks Hybrid OldApp exits while tryNewDot is still unresolved', () => {
        expect(shouldBlockOldAppExit(undefined, true, true)).toBe(true);
    });

    it('keeps unlocked users unlocked once tryNewDot has resolved', () => {
        expect(shouldBlockOldAppExit(undefined, false, true)).toBe(false);
        expect(shouldBlockOldAppExit(undefined, false, false)).toBe(false);
    });

    it('blocks all Hybrid OldApp exits for users locked to NewApp', () => {
        expect(shouldBlockOldAppExit({isLockedToNewApp: true} as TryNewDot, false, true)).toBe(true);
        expect(shouldBlockOldAppExit({isLockedToNewApp: true} as TryNewDot, false, false)).toBe(true);
    });

    it('blocks the OldDot redirect when the classicRedirect nudge has gone stale', () => {
        const tryNewDot: Parameters<typeof isOldAppRedirectBlocked>[0] = {
            classicRedirect: {
                dismissed: false,
                completedHybridAppOnboarding: false,
                // @ts-expect-error - NVP data is serialized with a string timestamp.
                timestamp: subDays(new Date(), 31).toISOString(),
            },
        };

        expect(isOldAppRedirectBlocked(tryNewDot, false)).toBe(true);
    });

    it('still shows the OldDot redirect when the classicRedirect nudge is fresh', () => {
        const tryNewDot: Parameters<typeof isOldAppRedirectBlocked>[0] = {
            classicRedirect: {
                dismissed: false,
                completedHybridAppOnboarding: false,
                // @ts-expect-error - NVP data is serialized with a string timestamp.
                timestamp: subDays(new Date(), 5).toISOString(),
            },
        };

        expect(isOldAppRedirectBlocked(tryNewDot, false)).toBe(false);
    });

    it('reports that a user has been in NewDot 30 days when the nudge is over a month old and not dismissed', () => {
        const tryNewDot: Parameters<typeof hasBeenInNewDot30Days>[0] = {
            classicRedirect: {
                dismissed: false,
                completedHybridAppOnboarding: false,
                // @ts-expect-error - NVP data is serialized with a string timestamp.
                timestamp: subDays(new Date(), 31).toISOString(),
            },
        };

        expect(hasBeenInNewDot30Days(tryNewDot)).toBe(true);
    });

    it('does not report 30 days in NewDot when the nudge is less than a month old', () => {
        const tryNewDot: Parameters<typeof hasBeenInNewDot30Days>[0] = {
            classicRedirect: {
                dismissed: false,
                completedHybridAppOnboarding: false,
                // @ts-expect-error - NVP data is serialized with a string timestamp.
                timestamp: subDays(new Date(), 10).toISOString(),
            },
        };

        expect(hasBeenInNewDot30Days(tryNewDot)).toBe(false);
    });

    it('does not report 30 days in NewDot once the user has dismissed the nudge', () => {
        const tryNewDot: Parameters<typeof hasBeenInNewDot30Days>[0] = {
            classicRedirect: {
                dismissed: true,
                completedHybridAppOnboarding: false,
                // @ts-expect-error - NVP data is serialized with a string timestamp.
                timestamp: subDays(new Date(), 60).toISOString(),
            },
        };

        expect(hasBeenInNewDot30Days(tryNewDot)).toBe(false);
    });

    it('does not report 30 days in NewDot when no timestamp is set', () => {
        const tryNewDot: Parameters<typeof hasBeenInNewDot30Days>[0] = {
            // @ts-expect-error - NVP data is serialized without newer required fields.
            classicRedirect: {
                dismissed: false,
            },
        };

        expect(hasBeenInNewDot30Days(tryNewDot)).toBe(false);
    });

    it('preserves isLockedToNewApp when nvp_tryNewDot is merged', async () => {
        await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, {
            isLockedToNewApp: true,
        });
        await waitForBatchedUpdatesWithAct();

        await Onyx.merge(ONYXKEYS.NVP_TRY_NEW_DOT, {
            classicRedirect: {
                dismissed: false,
            },
        });
        await waitForBatchedUpdatesWithAct();

        const tryNewDot = await getTryNewDot();

        expect(tryNewDot).toMatchObject({
            isLockedToNewApp: true,
            classicRedirect: {
                dismissed: false,
            },
        });
    });
});
