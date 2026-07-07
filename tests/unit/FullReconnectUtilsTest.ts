import DateUtils from '@libs/DateUtils';
import {getLastFullReconnectTimeToRecord, recordFullReconnectTimeFromResponse, shouldTriggerFullReconnect} from '@libs/FullReconnectUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

const CLIENT_NOW = '2026-06-12 10:00:00.000';
const BEFORE_CLIENT_NOW = '2026-06-12 09:59:00.000';
const AFTER_CLIENT_NOW = '2026-06-12 10:05:00.000';

function cutoffEntry(cutoff: string): AnyOnyxUpdate {
    return {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, value: cutoff};
}

function recordedTimeEntry(time: string): AnyOnyxUpdate {
    return {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.LAST_FULL_RECONNECT_TIME, value: time};
}

function someOtherEntry(): AnyOnyxUpdate {
    return {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.HAS_LOADED_APP, value: true};
}

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

    describe('recordFullReconnectTimeFromResponse', () => {
        beforeEach(() => {
            jest.spyOn(DateUtils, 'getDBTime').mockReturnValue(CLIENT_NOW);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('seeds the reconnect time right before the delivered cutoff and raises the successData entry to match', () => {
            // The request was built when no cutoff was known, so its successData holds client-now,
            // while the response delivers a cutoff ahead of the client clock.
            const responseOnyxData = [someOtherEntry(), cutoffEntry(AFTER_CLIENT_NOW)];
            const successData = [recordedTimeEntry(CLIENT_NOW)];

            recordFullReconnectTimeFromResponse(responseOnyxData, successData);

            expect(responseOnyxData).toEqual([someOtherEntry(), recordedTimeEntry(AFTER_CLIENT_NOW), cutoffEntry(AFTER_CLIENT_NOW)]);
            expect(successData).toEqual([recordedTimeEntry(AFTER_CLIENT_NOW)]);
        });

        it('changes nothing when the response delivers no cutoff', () => {
            const responseOnyxData = [someOtherEntry()];
            const successData = [recordedTimeEntry(CLIENT_NOW)];

            recordFullReconnectTimeFromResponse(responseOnyxData, successData);

            expect(responseOnyxData).toEqual([someOtherEntry()]);
            expect(successData).toEqual([recordedTimeEntry(CLIENT_NOW)]);
        });

        it('changes nothing when the request records no reconnect time (a partial ReconnectApp)', () => {
            const responseOnyxData = [cutoffEntry(AFTER_CLIENT_NOW)];
            const successData = [someOtherEntry()];

            recordFullReconnectTimeFromResponse(responseOnyxData, successData);

            expect(responseOnyxData).toEqual([cutoffEntry(AFTER_CLIENT_NOW)]);
            expect(successData).toEqual([someOtherEntry()]);
        });

        it('never lowers a reconnect time that was built from a newer cutoff than the response delivers', () => {
            const responseOnyxData = [cutoffEntry(BEFORE_CLIENT_NOW)];
            const successData = [recordedTimeEntry(AFTER_CLIENT_NOW)];

            recordFullReconnectTimeFromResponse(responseOnyxData, successData);

            expect(responseOnyxData).toEqual([recordedTimeEntry(AFTER_CLIENT_NOW), cutoffEntry(BEFORE_CLIENT_NOW)]);
            expect(successData).toEqual([recordedTimeEntry(AFTER_CLIENT_NOW)]);
        });

        it('never records a time that would ask for another reconnect at the delivered cutoff', () => {
            for (const deliveredCutoff of [BEFORE_CLIENT_NOW, CLIENT_NOW, AFTER_CLIENT_NOW]) {
                const responseOnyxData = [cutoffEntry(deliveredCutoff)];
                const successData = [recordedTimeEntry('')];

                recordFullReconnectTimeFromResponse(responseOnyxData, successData);

                expect(shouldTriggerFullReconnect(responseOnyxData.at(0)?.value as string, deliveredCutoff)).toBe(false);
            }
        });
    });
});
