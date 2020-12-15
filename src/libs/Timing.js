import {Graphite_Timer} from './API';

const timestampData = {};

/**
 * Start a performance timing measurment
 *
 * @param {String} eventName
 */
function start(eventName) {
    console.debug(`Timing.start(${eventName})`);

    timestampData[eventName] = Date.now();
}

/**
 * End a performance timing measurment
 *
 * @param {String} eventName
 */
function end(eventName) {
    console.debug(`Timing.end(${eventName})`);

    if (eventName in timestampData) {
        const eventTime = Date.now() - timestampData[eventName];
        console.debug(`Timing: output: ${eventTime}`);

        Graphite_Timer({
            name: eventName,
            value: eventTime,
            referer: 'chat'
        });
    }
}

export default {
    start,
    end
};
