import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type DisplayNameForm = Form<
    InputIDs,
    {
        [INPUT_IDS.FIRST_NAME]: string;
        [INPUT_IDS.LAST_NAME]: string;
    }
>;

export type {DisplayNameForm};
export default INPUT_IDS;
