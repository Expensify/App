import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    ROOM_NAME: 'roomName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RoomNameForm = Form<
    InputID,
    {
        [INPUT_IDS.ROOM_NAME]: string;
    }
>;

export type {RoomNameForm};
export default INPUT_IDS;
