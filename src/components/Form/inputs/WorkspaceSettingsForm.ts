import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    NAME: 'name',
} as const;

type WorkspaceSettingsForm = Form<{
    [INPUT_IDS.NAME]: string;
}>;

export default WorkspaceSettingsForm;
export {INPUT_IDS};
