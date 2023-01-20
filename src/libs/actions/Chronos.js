import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

/**
 * @param {String} eventID
 * @param {Object} reportAction
 * @param {String} reportAction.sequenceNumber
 * @param {Object[]} events
 */
const removeEvent = (eventID, reportAction, events) => {
    console.log('!!!', eventID, reportAction, events, '');
    API.write('RemoveChronosOOOEvent', {
        eventID,
        sequenceNumber: reportAction.sequenceNumber,
    }, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction.sequenceNumber}`,
            value: {
                originalMessage: {
                    events: _.omit(events, event => event.id === eventID),
                },
            },
        }],
    });
};

export {
    // eslint-disable-next-line import/prefer-default-export
    removeEvent,
};
