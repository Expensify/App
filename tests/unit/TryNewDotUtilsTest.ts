import {subDays} from 'date-fns';
import Onyx from 'react-native-onyx';
import {hasBeenInNewDot30Days, isOldAppRedirectBlocked, shouldBlockOldAppExit, shouldHideOldAppRedirect, shouldUseOldApp} from '@src/libs/TryNewDotUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TryNewDot} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

Onyx.init({keys: ONYXKEYS});

function getTryNewDot(): Promise<TryNewDot | null> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.NVP_TRY_NEW_DOT,
            initWithStoredValues: true,
            callback: (value) => {
                Onyx.disconnect(connectionID);
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

    it('keeps mobile-locked HybridApp users in NewApp', () => {
        const tryNewDot = {
            isLockedToNewApp: true,
            classicRedirect: {
                dismissed: true,
            },
        } as TryNewDot;

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
        const tryNewDot = {
            classicRedirect: {
                dismissed: false,
                timestamp: subDays(new Date(), 31).toISOString(),
            },
        } as unknown as TryNewDot;

        expect(isOldAppRedirectBlocked(tryNewDot, false)).toBe(true);
    });

    it('still shows the OldDot redirect when the classicRedirect nudge is fresh', () => {
        const tryNewDot = {
            classicRedirect: {
                dismissed: false,
                timestamp: subDays(new Date(), 5).toISOString(),
            },
        } as unknown as TryNewDot;

        expect(isOldAppRedirectBlocked(tryNewDot, false)).toBe(false);
    });

    it('reports that a user has been in NewDot 30 days when the nudge is over a month old and not dismissed', () => {
        const tryNewDot = {
            classicRedirect: {
                dismissed: false,
                timestamp: subDays(new Date(), 31).toISOString(),
            },
        } as unknown as TryNewDot;

        expect(hasBeenInNewDot30Days(tryNewDot)).toBe(true);
    });

    it('does not report 30 days in NewDot when the nudge is less than a month old', () => {
        const tryNewDot = {
            classicRedirect: {
                dismissed: false,
                timestamp: subDays(new Date(), 10).toISOString(),
            },
        } as unknown as TryNewDot;

        expect(hasBeenInNewDot30Days(tryNewDot)).toBe(false);
    });

    it('does not report 30 days in NewDot once the user has dismissed the nudge', () => {
        const tryNewDot = {
            classicRedirect: {
                dismissed: true,
                timestamp: subDays(new Date(), 60).toISOString(),
            },
        } as unknown as TryNewDot;

        expect(hasBeenInNewDot30Days(tryNewDot)).toBe(false);
    });

    it('does not report 30 days in NewDot when no timestamp is set', () => {
        const tryNewDot = {
            classicRedirect: {
                dismissed: false,
            },
        } as unknown as TryNewDot;

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
