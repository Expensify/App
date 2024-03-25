import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    PHONE_OR_EMAIL: 'phoneOrEmail',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type NewContactMethodForm = Form<
    InputID,
    {
        [INPUT_IDS.PHONE_OR_EMAIL]: string;
    }
>;

export type {NewContactMethodForm};
export default INPUT_IDS;
