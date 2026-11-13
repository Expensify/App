import {modifyRoomName} from '@libs/RoomNameInputUtils';

describe('modifyRoomName', () => {
    it('turns spaces into dashes', () => {
        // Given a room name typed with a space
        // When it is normalized for the room name input
        // Then the space becomes a dash, which is the only separator a room name allows
        expect(modifyRoomName('abc def')).toBe('#abc-def');
    });

    it('turns pasted line breaks into dashes like spaces', () => {
        // Given a room name pasted into the input, which can wrap onto several lines, with line breaks in it
        // When it is normalized for the room name input
        // Then each line break becomes a dash, so the result is a valid room name as it was before the input could wrap
        expect(modifyRoomName('abc\ndef')).toBe('#abc-def');
        expect(modifyRoomName('abc\r\ndef')).toBe('#abc-def');
    });
});
