import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    PHONE_OR_EMAIL: 'mergeAccountPhoneOrEmail',
    CONSENT: 'mergeAccountConsent',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MergeAccountDetailsForm = Form<
    InputID,
    {
        [INPUT_IDS.PHONE_OR_EMAIL]: string;
        [INPUT_IDS.CONSENT]: boolean;
    }
>;

export type {MergeAccountDetailsForm};
export default INPUT_IDS;
