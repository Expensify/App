import CONST from '../CONST';

/**
 * Replaces spaces with dashes
 *
 * @param {String} roomName
 * @returns {String}
 */
function modifyRoomName(roomName) {
    const modifiedRoomNameWithoutHash = roomName
        .toLowerCase()

        // Replaces unsupported symbols with hyphens, this is useful when copying and pasting a room name that may contain an unsupported symbol
        .replace(/[ .,;:"'!?<>&=$^+()[\]{}_\\/]/g, '-')

        // Replaces the smart dash on iOS devices with two hyphens
        .replace(/—/g, '--');

    return `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    modifyRoomName,
};
