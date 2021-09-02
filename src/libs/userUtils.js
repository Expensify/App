import CONST from '../CONST';

/**
 * Whether a login is system email
 *
 * @param {String} login - user email
 * @return {Boolean}
 */
function isSystemUser(login) {
    return [
        CONST.EMAIL.CONCIERGE,
        CONST.EMAIL.CHRONOS,
        CONST.EMAIL.RECEIPTS,
    ].includes(login);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    isSystemUser,
};
