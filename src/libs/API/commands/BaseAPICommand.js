import requireParameters from '../../requireParameters';
import * as Network from '../../Network';

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

    constructor(commandName, commandParams, requiredParameters) {
        this.#commandName = commandName;
        this.#commandParams = commandParams;
        this.#requiredParameters = requiredParameters;

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
