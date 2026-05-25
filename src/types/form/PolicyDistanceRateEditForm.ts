import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    RATE: 'rate',
    START_DATE: 'startDate',
    END_DATE: 'endDate',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type PolicyDistanceRateEditForm = Form<
    InputID,
    {
        [INPUT_IDS.RATE]: string;
        [INPUT_IDS.START_DATE]: string;
        [INPUT_IDS.END_DATE]: string;
    }
>;

export type {PolicyDistanceRateEditForm};
export default INPUT_IDS;
