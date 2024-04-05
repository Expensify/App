import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DOB: 'dob',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type DateOfBirthForm = Form<
    InputID,
    {
        /** Date of birth */
        [INPUT_IDS.DOB]: string;
    }
>;

export type {DateOfBirthForm};
export default INPUT_IDS;
