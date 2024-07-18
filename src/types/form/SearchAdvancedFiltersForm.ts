import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TYPE: 'type',
    DATE: 'date',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SearchAdvancedFiltersForm = Form<
    InputID,
    {
        [INPUT_IDS.TYPE]: string;
        [INPUT_IDS.DATE]: string;
    }
>;

export type {SearchAdvancedFiltersForm};
export default INPUT_IDS;
