import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    COMPANY_NAME: 'companyName',
    COMPANY_WEBSITE: 'companyWebsite',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MoneyRequestCompanyInfoForm = Form<
    InputID,
    {
        [INPUT_IDS.COMPANY_NAME]: string;
        [INPUT_IDS.COMPANY_WEBSITE]: string;
    }
>;

export type {MoneyRequestCompanyInfoForm};
export default INPUT_IDS;
