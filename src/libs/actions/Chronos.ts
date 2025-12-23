import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ChronosRemoveOOOEventParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ChronosOOOEvent} from '@src/types/onyx/OriginalMessage';

const removeEvent = (reportID: string | undefined, reportActionID: string, eventID: string, events: ChronosOOOEvent[]) => {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const parameters: ChronosRemoveOOOEventParams = {
        googleEventID: eventID,
        reportActionID,
    };

    API.write(WRITE_COMMANDS.CHRONOS_REMOVE_OOO_EVENT, parameters, {optimisticData, successData, failureData});
};

export {
    // eslint-disable-next-line import/prefer-default-export
    removeEvent,
};
