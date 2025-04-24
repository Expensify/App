import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NETSUITE_ACCOUNT_ID: 'netSuiteAccountID',
    NETSUITE_TOKEN_ID: 'netSuiteTokenID',
    NETSUITE_TOKEN_SECRET: 'netSuiteTokenSecret',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type NetSuiteTokenInputForm = Form<
    InputID,
    {
        [INPUT_IDS.NETSUITE_ACCOUNT_ID]: string;
        [INPUT_IDS.NETSUITE_TOKEN_ID]: string;
        [INPUT_IDS.NETSUITE_TOKEN_SECRET]: string;
    }
>;

export type {NetSuiteTokenInputForm};
export default INPUT_IDS;
