import BaseAPICommand from './BaseAPICommand';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';

/**
 * API Commands that need to have some kind of blocking UI while the network request is being made
 * can extend this class.
 */
export default class extends BaseAPICommand {
    // Use withOnyx to access the data about this blocking request (eg. ValidateEmailCommand.blockingCommandOnyxKey)
    static blockingCommandOnyxKey = `BlockingCommand-${this.commandName}`;

    /**
     * An abstract method to define what should happen before the network request is made
     */
    startBlocking() {
        Onyx.merge(this.blockingCommandOnyxKey, {loading: true, error: null});
    }

    /**
     * An abstract method to define what should happen after the network request is made
     */
    finishBlocking() {
        Onyx.merge(this.blockingCommandOnyxKey, {loading: false});
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

    requestFailed(response) {
        super.requestFailed(response);

        Onyx.merge(this.blockingCommandOnyxKey, {error: response.message});
    }
}
