import CONST from '../CONST';

/**
 * Modifies the room name to follow our conventions:
 * - Max length 80 characters
 * - Cannot not include space or special characters, and we automatically apply an underscore for spaces
 * - Must be lowercase
 * @param {String} roomName
 * @returns {String}
 */
function modifyRoomName(roomName) {
    const modifiedRoomNameWithoutHash = roomName
        .replace(/ /g, '_')
        .replace(/[^a-zA-Z\d_]/g, '')
        .substr(0, CONST.REPORT.MAX_ROOM_NAME_LENGTH)
        .toLowerCase();

    return `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    modifyRoomName,
};
