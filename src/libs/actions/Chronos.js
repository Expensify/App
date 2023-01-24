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
    console.log('!!!', reportID, reportAction.sequenceNumber, eventID, _.omit(events, event => event.id === eventID))
    const sequenceNumber = reportAction.sequenceNumber;
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [sequenceNumber]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    originalMessage: {
                        events: _.omit(events, event => event.id === eventID),
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
                [sequenceNumber]: {
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
                [sequenceNumber]: {
                    pendingAction: null,
                },
            },
        },
    ];

    API.write('Chronos_RemoveOOOEvent', {
        eventID,
        sequenceNumber: reportAction.sequenceNumber,
        reportActionID: reportAction.reportActionID,
    }, {optimisticData, successData, failureData});
};

export {
    // eslint-disable-next-line import/prefer-default-export
    removeEvent,
};
