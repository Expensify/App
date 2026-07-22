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

        it('records the reconnect time right before the delivered cutoff', () => {
            const responseOnyxData = [someOtherEntry(), cutoffEntry(AFTER_CLIENT_NOW)];

            recordFullReconnectTimeFromResponse(responseOnyxData, '');

            expect(responseOnyxData).toEqual([someOtherEntry(), recordedTimeEntry(AFTER_CLIENT_NOW), cutoffEntry(AFTER_CLIENT_NOW)]);
        });

        it('records client-now when the response delivers no cutoff and none is held', () => {
            const responseOnyxData = [someOtherEntry()];

            recordFullReconnectTimeFromResponse(responseOnyxData, '');

            expect(responseOnyxData).toEqual([someOtherEntry(), recordedTimeEntry(CLIENT_NOW)]);
        });

        it('records the held cutoff when the response delivers no cutoff, so an already-held cutoff never reads as stale again', () => {
            const responseOnyxData = [someOtherEntry()];

            recordFullReconnectTimeFromResponse(responseOnyxData, AFTER_CLIENT_NOW);

            expect(responseOnyxData).toEqual([someOtherEntry(), recordedTimeEntry(AFTER_CLIENT_NOW)]);
        });

        it('records the held cutoff when the response delivers an older one, so a Pusher update that overtook the response never reads as stale again', () => {
            const responseOnyxData = [cutoffEntry(BEFORE_CLIENT_NOW)];

            recordFullReconnectTimeFromResponse(responseOnyxData, AFTER_CLIENT_NOW);

            expect(responseOnyxData).toEqual([recordedTimeEntry(AFTER_CLIENT_NOW), cutoffEntry(BEFORE_CLIENT_NOW)]);
        });

        it('never records a time that would ask for another reconnect at the delivered or the held cutoff', () => {
            for (const deliveredCutoff of ['', BEFORE_CLIENT_NOW, CLIENT_NOW, AFTER_CLIENT_NOW]) {
                for (const heldCutoff of ['', BEFORE_CLIENT_NOW, CLIENT_NOW, AFTER_CLIENT_NOW]) {
                    const responseOnyxData = deliveredCutoff === '' ? [] : [cutoffEntry(deliveredCutoff)];

                    recordFullReconnectTimeFromResponse(responseOnyxData, heldCutoff);

                    const recordedTime: unknown = responseOnyxData.at(0)?.value;
                    const recorded = typeof recordedTime === 'string' ? recordedTime : '';
                    expect(shouldTriggerFullReconnect(recorded, deliveredCutoff)).toBe(false);
                    expect(shouldTriggerFullReconnect(recorded, heldCutoff)).toBe(false);
                }
            }
        });
    });
});
