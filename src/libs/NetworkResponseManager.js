import _ from 'underscore';

const NetworkResponseManager = {
    commandHandlers: {},
    subscribe(commandName, callback) {
        this.commandHandlers[commandName] = this.commandHandlers[commandName] || [];
        this.commandHandlers[commandName].push(callback);
        return () => {
            for (let i = 0; i < this.commandHandlers[commandName].length; i++) {
                if (this.commandHandlers[commandName][i] === callback) {
                    this.commandHandlers[commandName].splice(i, 1);
                    break;
                }
            }
        };
    },
    publish(commandName, response) {
        if (!this.commandHandlers[commandName]) {
            return;
        }

        _.each(this.commandHandlers[commandName], (callback) => {
            callback(response);
        });
    },
};

export default NetworkResponseManager;
