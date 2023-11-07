import CONST from '@src/CONST';

/**
 * Replaces spaces with dashes
 */
function modifyRoomName(roomName: string, skipPolicyPrefix?: boolean): string {
    const modifiedRoomNameWithoutHash = roomName
        .replace(/ /g, '-')

        // Replaces the smart dash on iOS devices with two hyphens
        .replace(/—/g, '--');

    return skipPolicyPrefix ? modifiedRoomNameWithoutHash : `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    modifyRoomName,
};
