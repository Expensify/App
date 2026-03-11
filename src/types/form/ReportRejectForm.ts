import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    COMMENT: 'comment',
    TARGET_ACCOUNT_ID: 'targetAccountID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ReportRejectForm = Form<
    InputID,
    {
        [INPUT_IDS.COMMENT]: string;
        [INPUT_IDS.TARGET_ACCOUNT_ID]: string;
    }
>;

export type {ReportRejectForm};
export default INPUT_IDS;
