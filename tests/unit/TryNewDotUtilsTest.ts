import Onyx from 'react-native-onyx';
import {isOldAppRedirectBlocked, shouldBlockOldAppExit, shouldUseOldApp} from '@src/libs/TryNewDotUtils';
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

    it('blocks Hybrid OldApp exits while tryNewDot is still unresolved', () => {
        expect(shouldBlockOldAppExit(undefined, false, true)).toBe(true);
    });

    it('keeps unlocked users unlocked once tryNewDot has resolved', () => {
        expect(shouldBlockOldAppExit(undefined, true, true)).toBe(false);
        expect(shouldBlockOldAppExit(undefined, true, false)).toBe(false);
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
