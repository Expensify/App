import type Form from './Form';

const INPUT_IDS = {
    DESCRIPTION: 'description',
} as const;

type WorkspaceDescriptionForm = Form<{
    [INPUT_IDS.DESCRIPTION]: string;
}>;

export type {WorkspaceDescriptionForm};
export default INPUT_IDS;
