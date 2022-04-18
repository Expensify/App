import _ from 'underscore';
import EventEmitter from 'events';

/**
 * A general-purpose set of event emitters.
 */
export default class EventScope {
    /**
     * @param {String} name – the name of the event scope
     * @param {Array<String>} events – all the event names within this event bus
     */
    constructor(name, events) {
        this.name = name;
        this.events = events;
        this.eventEmitters = _.reduce(events, (memo, event) => ({...memo, [event]: new EventEmitter()}), {});
    }

    /**
     * Trigger an event.
     *
     * @param {String} eventName – the event to trigger
     * @param {*} [eventData] – arbitrary arguments to pass to event handler(s) for this event
     */
    emit(eventName, ...eventData) {
        const emitter = this.eventEmitters[eventName];
        if (!emitter) {
            throw new Error(`The ${eventName} network event does not exist in the ${this.name} event scope`);
        }
        emitter.emit(eventName, ...eventData);
    }

    /**
     * Setup a handler for an event.
     *
     * @param {String} eventName
     * @param {Function} callback
     */
    on(eventName, callback) {
        const emitter = this.eventEmitters[eventName];
        if (!emitter) {
            throw new Error(`The ${eventName} network event does not exist in the ${this.name} event scope`);
        }
        emitter.on(eventName, callback);
    }
}
