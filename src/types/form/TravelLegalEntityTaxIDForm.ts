import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TAX_ID: 'taxID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type TravelLegalEntityTaxIDForm = Form<InputID, {[INPUT_IDS.TAX_ID]: string}>;

export type {TravelLegalEntityTaxIDForm};
export default INPUT_IDS;
