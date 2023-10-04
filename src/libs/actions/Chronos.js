import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

/**
 * @param {String} reportID
 * @param {String} reportActionID
 * @param {String} eventID
 * @param {Object[]} events
 */
const removeEvent = (reportID, reportActionID, eventID, events) => {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    originalMessage: {
                        events: _.reject(events, (event) => event.id === eventID),
                    },
                },
            },
        },
    ];

    const successData = [
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

    const failureData = [
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
