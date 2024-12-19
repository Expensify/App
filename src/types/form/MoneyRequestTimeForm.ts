import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    START_DATE: 'startDate',
    START_TIME: 'startTime',
    END_DATE: 'endDate',
    END_TIME: 'endTime',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MoneyRequestTimeForm = Form<
    InputID,
    {
        [INPUT_IDS.START_DATE]: string;
        [INPUT_IDS.START_TIME]: string;
        [INPUT_IDS.END_DATE]: string;
        [INPUT_IDS.END_TIME]: string;
    }
>;

export type {MoneyRequestTimeForm};
export default INPUT_IDS;
