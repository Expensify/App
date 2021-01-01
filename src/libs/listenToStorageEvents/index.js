/**
 * Listens for storage events so that multiple tabs can keep track of what
 * other tabs are doing
 *
 * @param {Function} callback
 */
function listenToStorageEvents(callback) {
    window.addEventListener('storage', (e) => {
        let newValue;
        try {
            newValue = JSON.parse(e.newValue);
        } catch (err) {
            console.debug('Could not parse the newValue of the storage event', err, e);
        }
        if (newValue !== undefined) {
            callback(e.key, newValue);
        }
    });
}

export default listenToStorageEvents;
