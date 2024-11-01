import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MAX_EXPENSE_AGE: 'maxExpenseAge',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RulesMaxExpenseAgeForm = Form<
    InputID,
    {
        [INPUT_IDS.MAX_EXPENSE_AGE]: string;
    }
>;

export type {RulesMaxExpenseAgeForm};
export default INPUT_IDS;
