import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type WorkspaceSettingsForm = Form<
    InputIDs,
    {
        [INPUT_IDS.NAME]: string;
    }
>;

export type {WorkspaceSettingsForm};
export default INPUT_IDS;
