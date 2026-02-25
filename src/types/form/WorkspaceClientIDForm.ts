import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CLIENT_ID: 'clientID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceClientIDForm = Form<
    InputID,
    {
        [INPUT_IDS.CLIENT_ID]: string;
    }
>;

export type {WorkspaceClientIDForm};
export default INPUT_IDS;
