import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

/**
 @param {String} reportID
 @param {String} eventID
 * @param {Object} reportAction
 * @param {String} reportAction.sequenceNumber
 * @param {Object[]} events
 */
const removeEvent = (reportID, eventID, reportAction, events) => {
    const reportActionID = reportAction.reportActionID;
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    originalMessage: {
                        events: _.filter(events, event => event.id !== eventID),
                    },
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    ...reportAction,
                    pendingAction: null,
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    API.write('Chronos_RemoveOOOEvent', {
        googleEventID: eventID,
        reportActionID,
    }, {optimisticData, successData, failureData});
};

export {
    // eslint-disable-next-line import/prefer-default-export
    removeEvent,
};
