import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import * as OnyxUpdates from '@src/libs/actions/OnyxUpdates';
import {flushQueue} from '@src/libs/actions/QueuedOnyxUpdates';
import DateUtils from '@src/libs/DateUtils';
import * as NumberUtils from '@src/libs/NumberUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('OnyxUpdatesTest', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it('applies Airship Onyx updates correctly', () => {
        const reportID = NumberUtils.rand64();
        const reportActionID = NumberUtils.rand64();
        const created = DateUtils.getDBTime();

        const reportValue = {reportID};
        const reportActionValue = {
            [reportActionID]: {
                reportActionID,
                created,
            },
        };

        // Given an onyx update from an Airship push notification
        const airshipUpdates: OnyxUpdatesFromServer<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
            type: CONST.ONYX_UPDATE_TYPES.AIRSHIP,
            previousUpdateID: 0,
            lastUpdateID: 1,
            updates: [
                {
                    eventType: '',
                    data: [
                        {
                            onyxMethod: 'merge',
                            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                            value: reportValue,
                        },
                        {
                            onyxMethod: 'merge',
                            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                            value: reportActionValue,
                            shouldShowPushNotification: true,
                        },
                    ],
                },
            ],
        };

        // When we apply the updates, then their values are updated correctly
        return OnyxUpdates.apply(airshipUpdates)
            .then(() => getOnyxValues(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`))
            .then(([report, reportAction]) => {
                expect(report).toStrictEqual(reportValue);
                expect(reportAction).toStrictEqual(reportActionValue);
            });
    });

    it('preserves the response object when HTTPS update is old and request has no successData/failureData/finallyData', async () => {
        // Given the client already has a lastUpdateID applied
        const currentUpdateID = 100;
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, currentUpdateID);
        await waitForBatchedUpdates();

        const mockResponse = {
            jsonCode: 200,
            transactionsPending3DSReview: {
                // an ID map key is not a name!
                // eslint-disable-next-line @typescript-eslint/naming-convention
                1234: {amount: 1000, currency: 'USD', created: '2026-02-23', expires: '2026-02-24', lastFourPAN: '1234', merchant: 'TestMerchant', transactionID: '1234'},
            },
            onyxData: [],
        };

        // When we apply an HTTPS update where lastUpdateID is already applied (i.e. "old"),
        // and the request has no successData/failureData/finallyData
        const result = await OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            lastUpdateID: currentUpdateID,
            previousUpdateID: currentUpdateID - 1,
            request: {
                command: 'GetTransactionsPending3DSReview',
                data: {},
            },
            response: mockResponse,
        });

        // Then the response should still be returned to the caller, not undefined
        expect(result).toBeDefined();
        expect(result?.jsonCode).toBe(200);
    });

    it('advances lastUpdateID only after the updates are successfully applied', async () => {
        // Given the client is caught up to update 10
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();

        const reportID = NumberUtils.rand64();
        const reportValue = {reportID};

        // When we apply a newer HTTPS update (lastUpdateID 20)
        await OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            previousUpdateID: 10,
            lastUpdateID: 20,
            request: {command: 'OpenReport', data: {apiRequestType: CONST.API_REQUEST_TYPE.READ}},
            response: {
                jsonCode: 200,
                onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, value: reportValue}],
            },
        });
        await waitForBatchedUpdates();

        // Then the updates are applied and the watermark advances to 20
        const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        const lastUpdateID = await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
        expect(report).toStrictEqual(reportValue);
        expect(lastUpdateID).toBe(20);
    });

    it('does not advance lastUpdateID when applying the updates fails', async () => {
        // Given the client is caught up to update 10
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();

        // And applying the onyx data will fail (e.g. a storage write error)
        const updateSpy = jest.spyOn(Onyx, 'update').mockRejectedValueOnce(new Error('storage write failed'));

        // When we apply a newer HTTPS update (lastUpdateID 20)
        await expect(
            OnyxUpdates.apply({
                type: CONST.ONYX_UPDATE_TYPES.HTTPS,
                previousUpdateID: 10,
                lastUpdateID: 20,
                request: {command: 'OpenReport', data: {apiRequestType: CONST.API_REQUEST_TYPE.READ}},
                response: {
                    jsonCode: 200,
                    onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${NumberUtils.rand64()}`, value: {}}],
                },
            }),
        ).rejects.toThrow('storage write failed');
        await waitForBatchedUpdates();

        // Then the watermark is not advanced, so the next reconnect can refetch and reapply the missed updates
        const lastUpdateID = await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
        expect(lastUpdateID).toBe(10);

        updateSpy.mockRestore();
    });

    it('advances lastUpdateID for WRITE requests only after the queued updates are flushed', async () => {
        // Given the client is caught up to update 10
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();

        const reportID = NumberUtils.rand64();
        const reportValue = {reportID};

        // When we apply a newer WRITE update (lastUpdateID 20), which only queues the updates in memory
        await OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            previousUpdateID: 10,
            lastUpdateID: 20,
            request: {command: 'AddComment', data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE}},
            response: {
                jsonCode: 200,
                onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, value: reportValue}],
            },
        });
        await waitForBatchedUpdates();

        // Then the watermark does not advance yet — the updates are only queued, not applied
        let lastUpdateID = await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
        expect(lastUpdateID).toBe(10);

        // When the sequential queue flushes the queued updates
        await flushQueue();
        await waitForBatchedUpdates();

        // Then the updates are applied and the watermark advances to 20
        const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        lastUpdateID = await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
        expect(report).toStrictEqual(reportValue);
        expect(lastUpdateID).toBe(20);
    });

    it('does not advance lastUpdateID for WRITE requests when the deferred flush fails', async () => {
        // Given the client is caught up to update 10
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();

        // When we apply a newer WRITE update (lastUpdateID 20), which only queues the updates in memory
        await OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            previousUpdateID: 10,
            lastUpdateID: 20,
            request: {command: 'AddComment', data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE}},
            response: {
                jsonCode: 200,
                onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${NumberUtils.rand64()}`, value: {}}],
            },
        });
        await waitForBatchedUpdates();

        // And the deferred flush fails to apply the queued updates (e.g. a storage write error)
        const updateSpy = jest.spyOn(Onyx, 'update').mockRejectedValueOnce(new Error('storage write failed'));
        await expect(flushQueue()).rejects.toThrow('storage write failed');
        await waitForBatchedUpdates();

        // Then the watermark is not advanced, so the next reconnect can refetch and reapply the missed updates
        const lastUpdateID = await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
        expect(lastUpdateID).toBe(10);

        updateSpy.mockRestore();
    });

    it('does not report a gap for updates staged for the deferred WRITE flush', async () => {
        // Given the client is caught up to update 10
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();

        // When we apply a WRITE update (lastUpdateID 20) whose updates are only staged for the deferred flush
        await OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            previousUpdateID: 10,
            lastUpdateID: 20,
            request: {command: 'AddComment', data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE}},
            response: {
                jsonCode: 200,
                onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${NumberUtils.rand64()}`, value: {}}],
            },
        });
        await waitForBatchedUpdates();

        // Then a following response chained on update 20 is not treated as a gap, even though the
        // persisted watermark is still at 10 — otherwise every queued WRITE would pause the queue
        expect(OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID: 20})).toBe(false);

        // And once the flush applies the staged updates, the persisted watermark catches up
        await flushQueue();
        await waitForBatchedUpdates();
        const lastUpdateID = await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
        expect(lastUpdateID).toBe(20);
    });

    it('resumes gap detection when the deferred WRITE flush fails', async () => {
        // Given the client is caught up to update 10
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();

        // And a WRITE update (lastUpdateID 20) whose updates are staged for the deferred flush
        await OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            previousUpdateID: 10,
            lastUpdateID: 20,
            request: {command: 'AddComment', data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE}},
            response: {
                jsonCode: 200,
                onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${NumberUtils.rand64()}`, value: {}}],
            },
        });
        await waitForBatchedUpdates();

        // When the deferred flush fails to apply the staged updates
        const updateSpy = jest.spyOn(Onyx, 'update').mockRejectedValueOnce(new Error('storage write failed'));
        await expect(flushQueue()).rejects.toThrow('storage write failed');
        await waitForBatchedUpdates();

        // Then the staged updates no longer count as applied, so the gap is detected and recovery can refetch them
        expect(OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID: 20})).toBe(true);

        updateSpy.mockRestore();
    });

    it('clears the pending flush watermark on sign-out', async () => {
        // Given the client is caught up to update 10 and a WRITE update (lastUpdateID 20) is staged for the deferred flush
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();
        await OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            previousUpdateID: 10,
            lastUpdateID: 20,
            request: {command: 'AddComment', data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE}},
            response: {
                jsonCode: 200,
                onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${NumberUtils.rand64()}`, value: {}}],
            },
        });
        await waitForBatchedUpdates();
        expect(OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID: 20})).toBe(false);

        // When the user signs out, which clears Onyx storage
        await Onyx.clear();
        await waitForBatchedUpdates();

        // Then the pending watermark from the previous session no longer masks gaps in the new session
        expect(OnyxUpdates.doesClientNeedToBeUpdated({clientLastUpdateID: 5, previousUpdateID: 15})).toBe(true);

        // Drain the staged updates so they don't leak into other tests
        await flushQueue();
    });

    it('does not move the watermark backwards when a slower older update settles after a newer one', async () => {
        // Given the client is caught up to update 10
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();

        // And an update for id 20 is applying, but its apply is held mid-flight
        let releaseApply: () => void = () => {};
        const updateSpy = jest.spyOn(Onyx, 'update').mockReturnValueOnce(
            new Promise<void>((resolve) => {
                releaseApply = resolve;
            }),
        );

        const applyPromise = OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            previousUpdateID: 10,
            lastUpdateID: 20,
            request: {command: 'OpenReport', data: {apiRequestType: CONST.API_REQUEST_TYPE.READ}},
            response: {jsonCode: 200, onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${NumberUtils.rand64()}`, value: {}}]},
        });

        // When a newer update (id 30) lands first
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 30);
        await waitForBatchedUpdates();

        // And only then does the older update finish applying
        releaseApply();
        await applyPromise;
        await waitForBatchedUpdates();

        // Then the watermark stays at 30 — the older update must not move it backwards to 20
        const lastUpdateID = await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
        expect(lastUpdateID).toBe(30);

        updateSpy.mockRestore();
    });

    it('applies full ReconnectApp Onyx updates even if they appear old', async () => {
        // Given the current lastUpdateIDAppliedToClient is merged
        const currentUpdateID = 100;
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, currentUpdateID);

        // And we received onyx updates from a full ReconnectApp request with the same lastUpdateID
        const reportID = NumberUtils.rand64();
        const reportValue = {reportID};
        const fullReconnectUpdates: OnyxUpdatesFromServer<typeof ONYXKEYS.COLLECTION.REPORT> = {
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            request: {
                command: SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP,
                data: {
                    updateIDFrom: null,
                },
            },
            response: {
                onyxData: [
                    {
                        onyxMethod: 'merge',
                        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                        value: reportValue,
                    },
                ],
            },
            previousUpdateID: currentUpdateID - 2,
            lastUpdateID: currentUpdateID - 1,
        };

        // When we apply the updates, then they are still applied even if the lastUpdateID is old
        await OnyxUpdates.apply(fullReconnectUpdates);
        const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(report).toStrictEqual(reportValue);
    });

    it.each([
        ['GetMissingOnyxMessages', SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES, {}],
        ['an incremental ReconnectApp', SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP, {updateIDFrom: 10}],
    ])('applies the catch-up response of %s even when it trails the pending flush watermark', async (_name, command, data) => {
        // Given the client is caught up to update 10, with a WRITE staged for the deferred flush up to update 500
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 10);
        await waitForBatchedUpdates();
        await OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            previousUpdateID: 10,
            lastUpdateID: 500,
            request: {command: 'AddComment', data: {apiRequestType: CONST.API_REQUEST_TYPE.WRITE}},
            response: {jsonCode: 200, onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${NumberUtils.rand64()}`, value: {}}]},
        });
        await waitForBatchedUpdates();
        expect(OnyxUpdates.getEffectiveLastUpdateID()).toBe(500);

        // When a catch-up response fills the range after the persisted watermark, below the staged one
        const reportID = NumberUtils.rand64();
        await OnyxUpdates.apply({
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            previousUpdateID: 10,
            lastUpdateID: 250,
            request: {command, data},
            response: {jsonCode: 200, onyxData: [{onyxMethod: 'merge', key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, value: {reportID}}]},
        });
        await waitForBatchedUpdates();

        // Then it is applied instead of discarded for looking old, which is what pinned the watermark and deadlocked the queue
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toStrictEqual({reportID});

        await flushQueue();
    });
});

function getOnyxValues<TKey extends OnyxKey>(...keys: TKey[]) {
    return Promise.all(keys.map((key) => getOnyxValue(key)));
}
