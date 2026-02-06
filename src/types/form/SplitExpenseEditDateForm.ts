import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    START_DATE: 'startDate',
    END_DATE: 'endDate',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SplitExpenseEditDateForm = Form<
    InputID,
    {
        [INPUT_IDS.START_DATE]: string;
        [INPUT_IDS.END_DATE]: string;
    }
>;

export type {SplitExpenseEditDateForm};
export default INPUT_IDS;
