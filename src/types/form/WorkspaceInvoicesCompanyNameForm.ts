import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    COMPANY_NAME: 'companyName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceInvoicesCompanyNameForm = Form<
    InputID,
    {
        [INPUT_IDS.COMPANY_NAME]: string;
    }
>;

export type {WorkspaceInvoicesCompanyNameForm};
export default INPUT_IDS;
