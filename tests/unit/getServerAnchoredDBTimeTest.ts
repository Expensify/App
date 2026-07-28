import {getDBTimeWithSkew, getServerAnchoredDBTime} from '@libs/NetworkState';
import {buildOptimisticAddCommentReportAction} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// A fixed client timestamp so the assertions don't depend on the wall clock.
const CLIENT_TS = Date.UTC(2026, 5, 29, 10, 0, 0);

/**
 * Converts a "yyyy-MM-dd HH:mm:ss.SSS" DB string back to epoch ms so we can assert the applied offset.
 */
function dbTimeToMs(dbTime: string): number {
    return new Date(`${dbTime.replace(' ', 'T')}Z`).valueOf();
}

/** Formats an epoch-ms value as a server DB-time string. */
function toDBTime(ms: number): string {
    return new Date(ms).toISOString().replace('T', ' ').replace('Z', '');
}

async function setSkew(skew: number) {
    await Onyx.merge(ONYXKEYS.NETWORK, {timeSkew: skew});
    await waitForBatchedUpdates();
}

describe('getServerAnchoredDBTime', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('anchors to the server clock when the client is ahead (negative skew), unlike getDBTimeWithSkew', async () => {
        // Given the client clock runs 5s ahead of the server
        await setSkew(-5000);

        // Then the server-anchored time is pulled back to the server clock
        expect(dbTimeToMs(getServerAnchoredDBTime(CLIENT_TS))).toBe(CLIENT_TS - 5000);

        // While getDBTimeWithSkew leaves the ahead client time untouched (it only pushes forward)
        expect(dbTimeToMs(getDBTimeWithSkew(CLIENT_TS))).toBe(CLIENT_TS);
    });

    it('applies positive skew the same way as getDBTimeWithSkew when the client is behind', async () => {
        // Given the client clock runs 5s behind the server
        await setSkew(5000);

        // Then both helpers push the timestamp forward to the server clock
        expect(dbTimeToMs(getServerAnchoredDBTime(CLIENT_TS))).toBe(CLIENT_TS + 5000);
        expect(dbTimeToMs(getDBTimeWithSkew(CLIENT_TS))).toBe(CLIENT_TS + 5000);
    });

    it('is a no-op when there is no skew', async () => {
        await setSkew(0);
        expect(dbTimeToMs(getServerAnchoredDBTime(CLIENT_TS))).toBe(CLIENT_TS);
    });

    it('clamps forward past the last action so a later send stays monotonic when skew turns negative', async () => {
        // Given skew has become 10s negative and the previous send already landed on the server clock 2s back
        await setSkew(-10000);
        const previousSend = toDBTime(CLIENT_TS - 2000);

        // Then the anchored time (which alone would be 10s back, before the previous send) is pushed just past it
        expect(dbTimeToMs(getServerAnchoredDBTime(CLIENT_TS, previousSend))).toBe(CLIENT_TS - 2000 + 1);
    });

    it('leaves the anchored time untouched when it is already after the last action', async () => {
        await setSkew(-1000);
        // The previous send is far in the past, so no clamp is needed
        expect(dbTimeToMs(getServerAnchoredDBTime(CLIENT_TS, toDBTime(CLIENT_TS - 60000)))).toBe(CLIENT_TS - 1000);
    });
});

describe('buildOptimisticAddCommentReportAction anchorCreatedToServer', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('routes the Concierge question `created` through the server-anchored clock under negative skew', async () => {
        // Given the client clock runs 5s ahead of the server
        await setSkew(-5000);

        // When the same message is built with and without the anchor flag
        const anchored = buildOptimisticAddCommentReportAction({text: 'How to connect QBD', delegateAccountIDParam: undefined, anchorCreatedToServer: true});
        const defaultClock = buildOptimisticAddCommentReportAction({text: 'How to connect QBD', delegateAccountIDParam: undefined});

        // Then the anchored `created` is pulled back to the server clock; the ~5s gap is what used to hide the reply.
        const gap = dbTimeToMs(defaultClock.reportAction.created) - dbTimeToMs(anchored.reportAction.created);
        expect(gap).toBeGreaterThanOrEqual(4900);
        expect(gap).toBeLessThanOrEqual(5100);
    });
});
