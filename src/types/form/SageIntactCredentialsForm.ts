import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    COMPANY_ID: 'companyID',
    USER_ID: 'userID',
    PASSWORD: 'password',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SageIntactCredentialsForm = Form<
    InputID,
    {
        [INPUT_IDS.COMPANY_ID]: string;
        [INPUT_IDS.USER_ID]: string;
        [INPUT_IDS.PASSWORD]: string;
    }
>;

export type {SageIntactCredentialsForm};
export default INPUT_IDS;
