import CONST from '@src/CONST';

import StringUtils from './StringUtils';

/**
 * Replaces spaces and line breaks with dashes
 */
function modifyRoomName(roomName: string): string {
    // The room name input can wrap onto several lines, so a pasted line break is treated like a space
    const modifiedRoomNameWithoutHash = StringUtils.lineBreaksToSpaces(roomName)
        .replaceAll(' ', '-')

        // Replaces the smart dash on iOS devices with two hyphens
        .replaceAll('—', '--');

    return `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    modifyRoomName,
};
