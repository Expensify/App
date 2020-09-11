/**
 * Listens for storage events so that multiple tabs can keep track of what
 * other tabs are doing
 *
 * @param {function} callback
 */
export default (callback) => {
    window.addEventListener('storage', (e) => {
        callback(e.key, JSON.parse(e.newValue));
    });
};
