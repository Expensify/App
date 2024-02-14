import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    LEGAL_FIRST_NAME: 'legalFirstName',
    LEGAL_LAST_NAME: 'legalLastName',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type LegalNameForm = Form<
    InputIDs,
    {
        [INPUT_IDS.LEGAL_FIRST_NAME]: string;
        [INPUT_IDS.LEGAL_LAST_NAME]: string;
    }
>;

export type {LegalNameForm};
export default INPUT_IDS;
