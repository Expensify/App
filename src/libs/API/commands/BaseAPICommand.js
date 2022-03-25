import requireParameters from '../../requireParameters';
import * as Network from '../../Network';

/**
 * All API commands will extend from this class to get basic functionality for making a network request
 * and handling the data-changed event.
 */
export default class {
    /**
     * The name of the API command (eg. command=Get)
     */
    #commandName = '';

    /**
     * Any additional params for the command name (eg. rvl=chatList)
     */
    #commandParams = {};

    /**
     * A list of parameters that are required when this command is called
     * @type {[]}
     */
    #requiredParameters = [];

    constructor() {
        DataChanged.subscribe(this.#commandName, this.processDataChanged);
    }

    /**
     * An abstract function which should handle the DataChanged event for this command
     */
    processDataChanged() {
        throw new Error('This abstract method needs defined in the class extending BaseAPICommand');
    }

    /**
     * Make the network request for this command
     *
     * @param {Object} parameters
     * @return {Promise}
     */
    makeRequest(parameters) {
        requireParameters(this.#requiredParameters, parameters, this.#commandName);
        return Network.post(this.#commandName, parameters);
    }
}
