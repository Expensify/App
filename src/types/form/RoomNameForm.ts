import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    ROOM_NAME: 'roomName',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type RoomNameForm = Form<
    InputIDs,
    {
        [INPUT_IDS.ROOM_NAME]: string;
    }
>;

export type {RoomNameForm};
export default INPUT_IDS;
