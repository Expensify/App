// @TODO open an issue and get this working for React Native for Web instead of using this shim. It should be supported but for some reason it is not working.

const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const unsubscribe = connection ? connection.removeEventListener('change', () => {}) : () => {
    window.removeEventListener('offline', () => {});
    window.removeEventListener('online', () => {});
};

function addEventListener(callback) {
    if (connection) {
        connection.addEventListener('change', () => callback(navigator.onLine));
    } else {
        window.addEventListener('offline', () => callback(false));
        window.addEventListener('online', () => callback(true));
    }

    return unsubscribe;
}

export default {
    addEventListener,
};
