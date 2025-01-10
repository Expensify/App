import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NSQS_ACCOUNT_ID: 'nsqsAccountID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type NetSuiteQuickStartOAuth2Form = Form<
    InputID,
    {
        [INPUT_IDS.NSQS_ACCOUNT_ID]: string;
    }
>;

export type {NetSuiteQuickStartOAuth2Form};
export default INPUT_IDS;
