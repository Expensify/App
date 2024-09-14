import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'savedSearchNewName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SearchSavedSearchRenameForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
    }
>;

export type {SearchSavedSearchRenameForm};
export default INPUT_IDS;
