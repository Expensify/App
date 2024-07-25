import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TYPE: 'type',
    DATE_AFTER: 'dateAfter',
    DATE_BEFORE: 'dateBefore',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SearchAdvancedFiltersForm = Form<
    InputID,
    {
        [INPUT_IDS.TYPE]: string;
        [INPUT_IDS.DATE_AFTER]: string;
        [INPUT_IDS.DATE_BEFORE]: string;
    }
>;

export type {SearchAdvancedFiltersForm};
export default INPUT_IDS;
