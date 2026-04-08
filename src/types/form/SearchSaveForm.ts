import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'searchSaveName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SearchSaveForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
    }
>;

export type {SearchSaveForm};
export default INPUT_IDS;
