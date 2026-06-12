import DateUtils from '@libs/DateUtils';
import {getFullReconnectSeedTime, shouldTriggerFullReconnect} from '@libs/FullReconnectUtils';

const CLIENT_NOW = '2026-06-12 10:00:00.000';
const BEFORE_CLIENT_NOW = '2026-06-12 09:59:00.000';
const AFTER_CLIENT_NOW = '2026-06-12 10:05:00.000';

describe('FullReconnectUtils', () => {
    describe('shouldTriggerFullReconnect', () => {
        test.each([
            ['receipt is stale (older than the NVP demand)', BEFORE_CLIENT_NOW, CLIENT_NOW, true],
            ['receipt equals the NVP demand', CLIENT_NOW, CLIENT_NOW, false],
            ['receipt is newer than the NVP demand', AFTER_CLIENT_NOW, CLIENT_NOW, false],
            ['receipt is empty (fresh install) against any NVP demand', '', CLIENT_NOW, true],
            ['NVP demand is empty', CLIENT_NOW, '', false],
            ['both receipt and NVP demand are empty', '', '', false],
        ])('%s', (_, lastFullReconnectTime, reconnectAppIfFullReconnectBefore, expected) => {
            expect(shouldTriggerFullReconnect(lastFullReconnectTime, reconnectAppIfFullReconnectBefore)).toBe(expected);
        });
    });

    describe('getFullReconnectSeedTime', () => {
        beforeEach(() => {
            jest.spyOn(DateUtils, 'getDBTime').mockReturnValue(CLIENT_NOW);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test.each([
            ['client clock is ahead of the NVP demand → client-now', BEFORE_CLIENT_NOW, CLIENT_NOW],
            ['client clock is behind the NVP demand (the skew regime) → NVP', AFTER_CLIENT_NOW, AFTER_CLIENT_NOW],
            ['client clock equals the NVP demand → client-now', CLIENT_NOW, CLIENT_NOW],
            ['NVP demand is empty (the post-clear regime) → client-now', '', CLIENT_NOW],
        ])('%s', (_, reconnectAppIfFullReconnectBefore, expected) => {
            expect(getFullReconnectSeedTime(reconnectAppIfFullReconnectBefore)).toBe(expected);
        });

        it('never returns a value that would re-trigger shouldTriggerFullReconnect for the answered NVP', () => {
            for (const nvp of ['', BEFORE_CLIENT_NOW, CLIENT_NOW, AFTER_CLIENT_NOW]) {
                expect(shouldTriggerFullReconnect(getFullReconnectSeedTime(nvp), nvp)).toBe(false);
            }
        });
    });
});
