import {Graphite_Timer} from './API';

const timestamps = [];

/**
 * Start a performance timing measurment
 *
 * @param {String} eventName
 */
function start(eventName) {
    console.debug(`Timing.start(${eventName})`);
    timestamps.push(1);
}

/**
 * End a performance timing measurment
 *
 * @param {String} eventName
 */
function end(eventName) {
    console.debug(`Timing.end(${eventName})`);
    const eventTime = 1;

    Graphite_Timer({
        name: eventName,
        value: eventTime,
        referer: 'chat'
    });
}

export default {
    start,
    end
};
