import BaseAPICommand from './BaseAPICommand';

/**
 * API Commands that need to have some kind of blocking UI while the network request is being made
 * can extend this class.
 */
export default class extends BaseAPICommand {
    /**
     * An abstract method to define what should happen before the network request is made
     */
    startBlocking() {
        throw new Error('This abstract method needs defined in the class extending BaseAPICommandBlocking');
    }

    /**
     * An abstract method to define what should happen after the network request is made
     */
    finishBlocking() {
        throw new Error('This abstract method needs defined in the class extending BaseAPICommandBlocking');
    }

    /**
     * Override the base makeRequest method to add the blocking functionality
     *
     * @param {Object} parameters
     * @return {Promise<unknown>}
     */
    makeRequest(parameters) {
        this.startBlocking();
        return super.makeRequest(parameters).finally(this.finishBlocking);
    }
}
