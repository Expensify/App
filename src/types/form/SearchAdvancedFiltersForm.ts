import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type Form from './Form';

const INPUT_IDS = {
    TYPE: 'type',
    DATE: {
        AFTER: 'dateAfter',
        BEFORE: 'dateBefore',
    },
} as const;

type InputID = DeepValueOf<typeof INPUT_IDS>;

type Date = {
    [INPUT_IDS.DATE.AFTER]: string;
    [INPUT_IDS.DATE.BEFORE]: string;
};

type SearchAdvancedFiltersForm = Form<
    InputID,
    {
        [INPUT_IDS.TYPE]: string;
    } & Date
>;

export type {SearchAdvancedFiltersForm};
export default INPUT_IDS;
