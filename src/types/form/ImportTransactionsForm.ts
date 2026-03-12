import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CARD_DISPLAY_NAME: 'cardDisplayName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ImportTransactionsForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_DISPLAY_NAME]: string;
    }
>;

export type {ImportTransactionsForm};
export default INPUT_IDS;
