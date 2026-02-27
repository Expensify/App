import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TAX_CODE: 'taxCode',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceTaxCodeForm = Form<
    InputID,
    {
        [INPUT_IDS.TAX_CODE]: string;
    }
>;

export type {WorkspaceTaxCodeForm};
export default INPUT_IDS;
