import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    WELCOME_MESSAGE: 'welcomeMessage',
} as const;

type WorkspaceInviteMessageForm = Form<{
    [INPUT_IDS.WELCOME_MESSAGE]: string;
}>;

export type {WorkspaceInviteMessageForm};
export default INPUT_IDS;
