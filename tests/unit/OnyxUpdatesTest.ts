import type {KeyValueMapping, OnyxEntry, OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import getOnyxValue from 'tests/utils/getOnyxValue';
import CONST from '@src/CONST';
import * as OnyxUpdates from '@src/libs/actions/OnyxUpdates';
import DateUtils from '@src/libs/DateUtils';
import * as NumberUtils from '@src/libs/NumberUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
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
});

function getOnyxValues<TKey extends OnyxKey>(...keys: TKey[]) {
    return Promise.all(keys.map((key) => getOnyxValue(key)));
}
