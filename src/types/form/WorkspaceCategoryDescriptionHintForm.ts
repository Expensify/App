import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    COMMENT_HINT: 'commentHint',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceCategoryDescriptionHintForm = Form<
    InputID,
    {
        [INPUT_IDS.COMMENT_HINT]: string;
    }
>;

export type {WorkspaceCategoryDescriptionHintForm};
export default INPUT_IDS;
