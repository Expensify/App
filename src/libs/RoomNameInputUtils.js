import CONST from '../CONST';

/**
 * Modifies the room name in the following ways:
 * - Replaces spaces with dashes
 * - Makes all letters lowercase
 * @param {String} roomName
 * @returns {String}
 */
function modifyRoomName(roomName) {
    const modifiedRoomNameWithoutHash = roomName
        .replace(/ /g, '-')
        .toLowerCase();

    return `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    modifyRoomName,
};
