import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CATEGORY_NAME: 'categoryName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceCategoryCreateForm = Form<
    InputID,
    {
        [INPUT_IDS.CATEGORY_NAME]: string;
    }
>;

export type {WorkspaceCategoryCreateForm};
export default INPUT_IDS;
