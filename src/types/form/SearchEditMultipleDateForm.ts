import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DATE: 'date',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SearchEditMultipleDateForm = Form<
    InputID,
    {
        [INPUT_IDS.DATE]: string;
    }
>;

export type {SearchEditMultipleDateForm};
export default INPUT_IDS;
