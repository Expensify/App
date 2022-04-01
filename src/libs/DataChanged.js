const callbacksByAPICommandName = {};

/**
 * @param {String} apiCommandName
 * @param {any} [data]
 */
function publish(apiCommandName, data = {}) {
    const callbacksToTrigger = callbacksByAPICommandName[apiCommandName];
    if (!callbacksToTrigger) {
        return;
    }
    for (let i = 0; i < callbacksToTrigger.length; i++) {
        callbacksToTrigger[i](data);
    }
}

/**
 * @param {String} apiCommandName
 * @param {Function} callback
 */
function subscribe(apiCommandName, callback) {
    if (!callbacksByAPICommandName[apiCommandName]) {
        callbacksByAPICommandName[apiCommandName] = [];
    }
    callbacksByAPICommandName[apiCommandName].push(callback);
}

export {
    publish,
    subscribe,
};
