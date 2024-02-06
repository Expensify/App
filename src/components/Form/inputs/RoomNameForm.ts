import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    ROOM_NAME: 'roomName',
} as const;

type RoomNameForm = Form<{
    [INPUT_IDS.ROOM_NAME]: string;
}>;

export default RoomNameForm;
export {INPUT_IDS};
