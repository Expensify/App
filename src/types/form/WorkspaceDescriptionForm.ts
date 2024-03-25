import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DESCRIPTION: 'description',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceDescriptionForm = Form<
    InputID,
    {
        [INPUT_IDS.DESCRIPTION]: string;
    }
>;

export type {WorkspaceDescriptionForm};
export default INPUT_IDS;
