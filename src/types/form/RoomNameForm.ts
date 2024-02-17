import type Form from './Form';

const INPUT_IDS = {
    ROOM_NAME: 'roomName',
} as const;

type RoomNameForm = Form<{
    [INPUT_IDS.ROOM_NAME]: string;
}>;

export type {RoomNameForm};
export default INPUT_IDS;
