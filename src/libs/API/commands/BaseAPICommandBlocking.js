import BaseAPICommand from './BaseAPICommand';

export default class extends BaseAPICommand {
    /**
     * An abstract method to define what should happen before the network request is made
     */
    startBlocking() {
        throw new Error('This abstract method needs defined in the class extending BaseAPICommand');
    }

    /**
     * An abstract method to define what should happen after the network request is made
     */
    finishBlocking() {
        throw new Error('This abstract method needs defined in the class extending BaseAPICommand');
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
