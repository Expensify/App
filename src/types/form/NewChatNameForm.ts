import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NEW_CHAT_NAME: 'newChatName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type NewChatNameForm = Form<
    InputID,
    {
        [INPUT_IDS.NEW_CHAT_NAME]: string;
    }
>;

export type {NewChatNameForm};
export default INPUT_IDS;
