import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    NAME: 'name',
} as const;

type WorkspaceSettingsForm = Form<{
    [INPUT_IDS.NAME]: string;
}>;

export type {WorkspaceSettingsForm};
export default INPUT_IDS;
