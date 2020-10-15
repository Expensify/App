/**
 * Listens for storage events so that multiple tabs can keep track of what
 * other tabs are doing
 *
 * @param {function} callback
 */
function addStorageEventHandler(callback) {
    window.addEventListener('storage', (e) => {
        let newValue;
        try {
            newValue = JSON.parse(e.newValue);
        } catch (err) {
            console.error('Could not parse the newValue of the storage event', err, e);
        }
        if (newValue !== undefined) {
            callback(e.key, newValue);
        }
    });
}

export default addStorageEventHandler;
