import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import * as OnyxUpdates from '@src/libs/actions/OnyxUpdates';
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
});

function getOnyxValues<TKey extends OnyxKey>(...keys: TKey[]) {
    return Promise.all(keys.map((key) => getOnyxValue(key)));
}
