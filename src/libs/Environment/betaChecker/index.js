/**
 * There's no beta build in non native
 *
 * @returns {Promise}
 */
function isBetaBuild() {
    return Promise.resolve(false);
}

export default {
    isBetaBuild,
};
