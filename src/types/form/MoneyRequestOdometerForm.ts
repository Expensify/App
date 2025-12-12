import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    START_READING: 'startReading',
    END_READING: 'endReading',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MoneyRequestOdometerForm = Form<
    InputID,
    {
        [INPUT_IDS.START_READING]: string;
        [INPUT_IDS.END_READING]: string;
    }
>;

export type {MoneyRequestOdometerForm};
export default INPUT_IDS;
