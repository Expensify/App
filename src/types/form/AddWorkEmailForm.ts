import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    EMAIL: 'email',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type AddWorkEmailForm = Form<
    InputID,
    {
        [INPUT_IDS.EMAIL]: string;
    }
>;

export type {AddWorkEmailForm};
export default INPUT_IDS;
