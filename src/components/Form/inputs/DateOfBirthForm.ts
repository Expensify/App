import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    DOB: 'dob',
} as const;

type DateOfBirthForm = Form<{
    [INPUT_IDS.DOB]: string;
}>;

export type {DateOfBirthForm};
export default INPUT_IDS;
