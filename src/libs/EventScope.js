import _ from 'underscore';
import EventEmitter from 'events';

/**
 * Validate that an event exists in a scope and return its EventEmitter.
 *
 * @param {Object<String, EventEmitter>} eventEmitters
 * @param {String} eventName
 * @returns {EventEmitter}
 * @throws {Error}
 */
function getEventEmitter(eventEmitters, eventName) {
    const emitter = eventEmitters[eventName];
    if (!emitter) {
        throw new Error(`The ${eventName} event does not exist in the ${this.name} event scope`);
    }
    return emitter;
}

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
        const emitter = getEventEmitter(this.eventEmitters, eventName);
        emitter.emit(eventName, ...eventData);
    }

    /**
     * Set up a handler for an event.
     *
     * @param {String} eventName
     * @param {Function} callback
     * @returns {Function} cleanup function to remove this listener
     */
    on(eventName, callback) {
        const emitter = getEventEmitter(this.eventEmitters, eventName);
        emitter.on(eventName, callback);
        return () => emitter.removeListener(eventName, callback);
    }

    /**
     * Set up a one-time handler for an event. Useful when you're waiting for something to be ready to do something.
     *
     * @example
     *
     * MyEventScope.once('ready', doSomething());
     * MyEventScope.emit('ready'); // doSomething() will now execute
     *
     * @param {String} eventName
     * @param {Function} callback
     * @returns {Function} cleanup function to remove this listener
     */
    once(eventName, callback) {
        const emitter = getEventEmitter(this.eventEmitters, eventName);
        emitter.once(eventName, callback);
        return () => emitter.removeListener(eventName, callback);
    }
}
