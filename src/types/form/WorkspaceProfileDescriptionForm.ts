import type Form from './Form';

const INPUT_IDS = {
    DESCRIPTION: 'description',
} as const;

type WorkspaceProfileDescriptionForm = Form<{
    [INPUT_IDS.DESCRIPTION]: string;
}>;

export type {WorkspaceProfileDescriptionForm};
export default INPUT_IDS;
