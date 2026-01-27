import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    COMPANY_CARD_LAYOUT_NAME: 'companyCardLayoutName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type CompanyCardLayoutNameForm = Form<
    InputID,
    {
        [INPUT_IDS.COMPANY_CARD_LAYOUT_NAME]: string;
    }
>;

export type {CompanyCardLayoutNameForm};
export default INPUT_IDS;

