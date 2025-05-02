import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    COMPANY_WEBSITE: 'companyWebsite',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceInvoicesCompanyWebsiteForm = Form<
    InputID,
    {
        [INPUT_IDS.COMPANY_WEBSITE]: string;
    }
>;

export type {WorkspaceInvoicesCompanyWebsiteForm};
export default INPUT_IDS;
