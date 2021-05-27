/**
 * There's no beta build in non native
 *
 * @returns {Promise}
 */
function isBetaBuild() {
    return new Promise(resolve => resolve(false));
}

export default {
    isBetaBuild,
};
