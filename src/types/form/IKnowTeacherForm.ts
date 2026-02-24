import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    PARTNER_USER_ID: 'partnerUserID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type IKnowTeacherForm = Form<
    InputID,
    {
        [INPUT_IDS.FIRST_NAME]: string;
        [INPUT_IDS.LAST_NAME]: string;
        [INPUT_IDS.PARTNER_USER_ID]: string;
    }
>;

export type {IKnowTeacherForm};
export default INPUT_IDS;
