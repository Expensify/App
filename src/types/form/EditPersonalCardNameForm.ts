import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type EditPersonalCardNameForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
    }
>;

export type {EditPersonalCardNameForm};
export default INPUT_IDS;
