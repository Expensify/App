import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    REASON_FOR_LEAVING: 'reasonForLeaving',
    PHONE_OR_EMAIL: 'phoneOrEmail',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type CloseAccountForm = Form<
    InputIDs,
    {
        [INPUT_IDS.REASON_FOR_LEAVING]: string;
        [INPUT_IDS.PHONE_OR_EMAIL]: string;
    }
>;

export type {CloseAccountForm};
export default INPUT_IDS;
