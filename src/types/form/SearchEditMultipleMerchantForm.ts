import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MERCHANT: 'merchant',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SearchEditMultipleMerchantForm = Form<
    InputID,
    {
        [INPUT_IDS.MERCHANT]: string;
    }
>;

export type {SearchEditMultipleMerchantForm};
export default INPUT_IDS;
