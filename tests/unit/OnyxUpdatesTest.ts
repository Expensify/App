import type {OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import * as OnyxUpdates from '@src/libs/actions/OnyxUpdates';
import DateUtils from '@src/libs/DateUtils';
import * as NumberUtils from '@src/libs/NumberUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
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
        const airshipUpdates: OnyxUpdatesFromServer = {
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

    it('applies full ReconnectApp Onyx updates even if they appear old', async () => {
        // Given the current lastUpdateIDAppliedToClient is merged
        const currentUpdateID = 100;
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, currentUpdateID);

        // And we received onyx updates from a full ReconnectApp request with the same lastUpdateID
        const reportID = NumberUtils.rand64();
        const reportValue = {reportID};
        const fullReconnectUpdates: OnyxUpdatesFromServer = {
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
