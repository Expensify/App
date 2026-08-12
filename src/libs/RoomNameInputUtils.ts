import CONST from '@src/CONST';

/**
 * Replaces spaces with dashes
 */
function modifyRoomName(roomName: string): string {
    const modifiedRoomNameWithoutHash = roomName
        .replaceAll(' ', '-')

        // Replaces the smart dash on iOS devices with two hyphens
        .replaceAll('—', '--');

    return `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
}

export {
    /* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
    modifyRoomName,
};
