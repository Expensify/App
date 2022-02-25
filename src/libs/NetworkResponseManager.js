import _ from 'underscore';

const NetworkResponseManager = {
    commandHandlers: {},
    subscribe(commandName) {
        const connection = {
            onSuccess: () => {},
            onHandle: () => {},
        };

        this.commandHandlers[commandName] = this.commandHandlers[commandName] || [];
        this.commandHandlers[commandName].push(connection);

        connection.done = (successCallback) => {
            connection.onSuccess = successCallback;
            return connection;
        };

        connection.handle = (jsonCodes, callback) => {
            connection.onHandle = [jsonCodes, callback];
            return connection;
        };

        connection.cancel = () => {
            for (let i = 0; i < this.commandHandlers[commandName].length; i++) {
                if (this.commandHandlers[commandName][i] === connection) {
                    this.commandHandlers[commandName].splice(i, 1);
                    break;
                }
            }
        };

        return connection;
    },
    publish(commandName, payload) {
        if (!this.commandHandlers[commandName]) {
            return;
        }

        const {response} = payload;
        _.each(this.commandHandlers[commandName], (connection) => {
            if (response.jsonCode === 200 && connection.onSuccess) {
                connection.onSuccess(payload);
                return;
            }

            if (!connection.onHandle) {
                return;
            }

            const [jsonCodes, callback] = connection.onHandle;
            if (!_.contains(jsonCodes, response.jsonCode)) {
                return;
            }

            callback(response.jsonCode, payload);
        });
    },
};

export default NetworkResponseManager;
