/**
 * Returns always false for other platforms
 *
 * @returns {Promise}
 */
export default function isAppInstalled() {
    return new Promise((resolve) => {
        resolve(false);
    });
}
