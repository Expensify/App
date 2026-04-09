import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DATE: 'date',
    TIME: 'time',
    DURATION_AMOUNT: 'durationAmount',
    DURATION_UNIT: 'durationUnit',
    REASON: 'reason',
    WORKING_PERCENTAGE: 'workingPercentage',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ChronosScheduleOOOForm = Form<
    InputID,
    {
        [INPUT_IDS.DATE]: string;
        [INPUT_IDS.TIME]: string;
        [INPUT_IDS.DURATION_AMOUNT]: string;
        [INPUT_IDS.DURATION_UNIT]: string;
        [INPUT_IDS.REASON]: string;
        [INPUT_IDS.WORKING_PERCENTAGE]: string;
    }
>;

export type {ChronosScheduleOOOForm};
export default INPUT_IDS;
