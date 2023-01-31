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

        // Replaces the smart dash on iOS devices with two hyphens
        .replace(/—/g, '--');

    return `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    modifyRoomName,
};
