import CONST from '../CONST';

/**
 * Replaces spaces with dashes
 *
 * @param {String} roomName
 * @returns {String}
 */
function modifyRoomName(roomName) {
    const modifiedRoomNameWithoutHash = roomName
        .replace(/ /g, '-')
        .replace(/—/g, '--');

    return `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    modifyRoomName,
};
