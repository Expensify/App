import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    REASON_FOR_LEAVING: 'reasonForLeaving',
    PHONE_OR_EMAIL: 'phoneOrEmail',
    SUCCESS: 'success',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type CloseAccountForm = Form<
    InputID,
    {
        [INPUT_IDS.REASON_FOR_LEAVING]: string;
        [INPUT_IDS.PHONE_OR_EMAIL]: string;
        [INPUT_IDS.SUCCESS]: string;
    }
>;

export type {CloseAccountForm};
export default INPUT_IDS;
