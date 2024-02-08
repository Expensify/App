import type Form from './Form';

const INPUT_IDS = {
    DOB: 'dob',
} as const;

type DateOfBirthForm = Form<{
    /** Date of birth */
    [INPUT_IDS.DOB]: string;
}>;

export type {DateOfBirthForm};
export default INPUT_IDS;
