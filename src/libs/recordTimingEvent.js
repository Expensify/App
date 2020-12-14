import {Graphite_Timer} from './API';

/**
 * Record a performance timing measurment, pushing to Grafina.
 *
 * @param {String} startEvent - Name of the tracking start event
 * @param {String} endEvent - Name of the tracking end event
 */
export default function (startEvent, endEvent) {
    try {
        const eventTime = window.performance.measure(endEvent, startEvent, endEvent).duration;

        Graphite_Timer({
            name: endEvent,
            value: eventTime,
            referer: 'chat'
        });

        // Measures should be cleared once 'end' events occur
        if (endEvent === 'HomePage_ReportsRetrieved' || endEvent === 'ReportSwitch_End') {
            window.performance.clearMeasures(endEvent);
        }
    } catch (error) {
        console.debug(`Unable to record performance timing for event: ${endEvent}, ${error}`);
    }
}
