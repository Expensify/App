import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TAG_NAME: 'tagName',
    TAG_GL_CODE: 'glCode',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceTagForm = Form<
    InputID,
    {
        [INPUT_IDS.TAG_NAME]: string;
        [INPUT_IDS.TAG_GL_CODE]: string;
    }
>;

export type {WorkspaceTagForm};
export default INPUT_IDS;
