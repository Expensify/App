import Log from '../Log';

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
            Log.hmmm('Could not parse the newValue of the storage event', {event: e, error: err});
        }
        if (newValue !== undefined) {
            callback(e.key, newValue);
        }
    });
}

export default listenToStorageEvents;
