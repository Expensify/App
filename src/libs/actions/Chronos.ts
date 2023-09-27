import Onyx, {OnyxUpdate} from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import {ChronosOOOEvent} from '../../types/onyx/OriginalMessage';

const removeEvent = (reportID: string, reportActionID: string, eventID: string, events: ChronosOOOEvent[]) => {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    originalMessage: {
                        events: events.filter((event) => event.id !== eventID),
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    originalMessage: {events},
                    pendingAction: null,
                },
            },
        },
    ];

    API.write(
        'Chronos_RemoveOOOEvent',
        {
            googleEventID: eventID,
            reportActionID,
        },
        {optimisticData, successData, failureData},
    );
};

export {
    // eslint-disable-next-line import/prefer-default-export
    removeEvent,
};
