import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    ROUTING_NUMBER: 'routingNumber',
    ACCOUNT_NUMBER: 'accountNumber',
    STREET: 'street',
    DATE_OF_BIRTH: 'dob',
    PICK_FRUIT: 'pickFruit',
    PICK_ANOTHER_FRUIT: 'pickAnotherFruit',
    STATE: 'state',
    CHECKBOX: 'checkbox',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type TestForm = Form<
    InputID,
    {
        [INPUT_IDS.ROUTING_NUMBER]: string;
        [INPUT_IDS.ACCOUNT_NUMBER]: string;
        [INPUT_IDS.STREET]: string;
        [INPUT_IDS.STATE]: string;
        [INPUT_IDS.DATE_OF_BIRTH]: string;
        [INPUT_IDS.PICK_FRUIT]: string;
        [INPUT_IDS.PICK_ANOTHER_FRUIT]: string;
        [INPUT_IDS.CHECKBOX]: boolean;
    }
>;

export type {TestForm};
export default INPUT_IDS;
