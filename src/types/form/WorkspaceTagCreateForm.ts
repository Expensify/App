import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TAG_NAME: 'tagName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceTagCreateForm = Form<
    InputID,
    {
        [INPUT_IDS.TAG_NAME]: string;
    }
>;

export type {WorkspaceTagCreateForm};
export default INPUT_IDS;
