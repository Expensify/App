import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    PHONE_OR_EMAIL: 'phoneOrEmail',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type NewContactMethodForm = Form<
    InputIDs,
    {
        [INPUT_IDS.PHONE_OR_EMAIL]: string;
    }
>;

export type {NewContactMethodForm};
export default INPUT_IDS;
