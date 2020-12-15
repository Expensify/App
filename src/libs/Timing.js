import {Graphite_Timer} from './API';

const timestampData = {};

/**
 * Start a performance timing measurment
 *
 * @param {String} eventName
 */
function start(eventName) {
    timestampData[eventName] = Date.now();
}

/**
 * End a performance timing measurment
 *
 * @param {String} eventName
 */
function end(eventName) {
    if (eventName in timestampData) {
        const eventTime = Date.now() - timestampData[eventName];

        Graphite_Timer({
            name: eventName,
            value: eventTime,
            referer: 'chat'
        });

        delete timestampData[eventName];
    }
}

export default {
    start,
    end
};
