import DateUtils from '@libs/DateUtils';
import {getLastFullReconnectTimeToRecord, shouldTriggerFullReconnect} from '@libs/FullReconnectUtils';

const CLIENT_NOW = '2026-06-12 10:00:00.000';
const BEFORE_CLIENT_NOW = '2026-06-12 09:59:00.000';
const AFTER_CLIENT_NOW = '2026-06-12 10:05:00.000';

describe('FullReconnectUtils', () => {
    describe('shouldTriggerFullReconnect', () => {
        test.each([
            ['last reconnect is older than the server cutoff', BEFORE_CLIENT_NOW, CLIENT_NOW, true],
            ['last reconnect equals the server cutoff', CLIENT_NOW, CLIENT_NOW, false],
            ['last reconnect is newer than the server cutoff', AFTER_CLIENT_NOW, CLIENT_NOW, false],
            ['last reconnect is empty (fresh install) against any cutoff', '', CLIENT_NOW, true],
            ['server cutoff is empty', CLIENT_NOW, '', false],
            ['both last reconnect and server cutoff are empty', '', '', false],
        ])('%s', (_, lastFullReconnectTime, serverReconnectCutoff, expected) => {
            expect(shouldTriggerFullReconnect(lastFullReconnectTime, serverReconnectCutoff)).toBe(expected);
        });
    });

    describe('getLastFullReconnectTimeToRecord', () => {
        beforeEach(() => {
            jest.spyOn(DateUtils, 'getDBTime').mockReturnValue(CLIENT_NOW);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test.each([
            ['client clock is ahead of the server cutoff, records client-now', BEFORE_CLIENT_NOW, CLIENT_NOW],
            ['client clock is behind the server cutoff, records the cutoff', AFTER_CLIENT_NOW, AFTER_CLIENT_NOW],
            ['client clock equals the server cutoff, records client-now', CLIENT_NOW, CLIENT_NOW],
            ['server cutoff is empty, records client-now', '', CLIENT_NOW],
        ])('%s', (_, serverReconnectCutoff, expected) => {
            expect(getLastFullReconnectTimeToRecord(serverReconnectCutoff)).toBe(expected);
        });

        it('never records a time that would ask for another reconnect at the same cutoff', () => {
            for (const cutoff of ['', BEFORE_CLIENT_NOW, CLIENT_NOW, AFTER_CLIENT_NOW]) {
                expect(shouldTriggerFullReconnect(getLastFullReconnectTimeToRecord(cutoff), cutoff)).toBe(false);
            }
        });
    });
});
