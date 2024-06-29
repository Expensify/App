import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    ACCOUNT_ID: 'accountID',
    TOKEN_ID: 'tokenID',
    TOKEN_SECRET: 'tokenSecret',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type NetSuiteTokenInputForm = Form<
    InputID,
    {
        [INPUT_IDS.ACCOUNT_ID]: string;
        [INPUT_IDS.TOKEN_ID]: string;
        [INPUT_IDS.TOKEN_SECRET]: string;
    }
>;

export type {NetSuiteTokenInputForm};
export default INPUT_IDS;
