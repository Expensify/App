import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
} as const;

type DisplayNameForm = Form<{
    [INPUT_IDS.FIRST_NAME]: string;
    [INPUT_IDS.LAST_NAME]: string;
}>;

export type {DisplayNameForm};
export default INPUT_IDS;
