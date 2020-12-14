import {Graphite_Timer} from './API';

const pageInitTime = 'HomePage_Init';

/**
 * Record a performance timing measurment, pushing to Grafina.
 *
 * @param {String} eventName - Name of the tracking event
 */
function logTimingEvent(eventName) {
    window.performance.mark(eventName);
    const eventTime = window.performance.measure(eventName, pageInitTime, eventName).duration;

    Graphite_Timer({
        name: eventName,
        value: eventTime
    });
}

export {
    pageInitTime,
    logTimingEvent
};
