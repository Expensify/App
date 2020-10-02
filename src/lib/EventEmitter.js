import _ from 'underscore';
import guid from './Guid';

/**
 * Pub/Sub class
 */
export default class EventEmitter {
    constructor() {
        this.callbackMap = {};
    }

    /**
     * Delete a callback from the map
     *
     * @param {String} eventID
     */
    unsubscribe(eventID) {
        const [eventName, id] = eventID.split('_');
        delete this.callbackMap[eventName][id];
    }

    /**
     *
     * @param {String} eventName
     * @param {Function} callback
     *
     * @returns {Function} method to unsubscribe the event
     */
    subscribe(eventName, callback) {
        if (!this.callbackMap[eventName]) {
            this.callbackMap[eventName] = {};
        }

        const eventID = guid();
        this.callbackMap[eventName][eventID] = callback;

        return () => this.unsubscribe(`${eventName}_${eventID}`);
    }

    /**
     * Publish an event
     *
     * @param {String} eventName
     * @param {*} data
     */
    emit(eventName, data) {
        const eventCallbacks = this.callbackMap[eventName];
        _.each(eventCallbacks, callback => callback(data));
    }
}
