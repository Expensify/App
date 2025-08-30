import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    RATE_NAME: 'rateName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type PolicyDistanceRateNameEditForm = Form<
    InputID,
    {
        [INPUT_IDS.RATE_NAME]: string;
    }
>;

export type {PolicyDistanceRateNameEditForm};
export default INPUT_IDS;
