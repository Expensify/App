/**
 * Listens for storage events so that multiple tabs can keep track of what
 * other tabs are doing
 *
 * @param {function} callback
 */
function addStorageEventHandler(callback) {
    window.addEventListener('storage', (e) => {
        callback(e.key, JSON.parse(e.newValue));
    });
}

export default addStorageEventHandler;
