function publish(commandName, changedData) {
    console.debug('DataChanged-publish()', commandName, changedData);
}

function subscribe(commandName, callback) {
    console.debug('DataChanged-subscribe()', commandName, callback);
}

export {
    publish,
    subscribe,
};
