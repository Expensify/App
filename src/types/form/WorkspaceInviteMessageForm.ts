import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    WELCOME_MESSAGE: 'welcomeMessage',
    ROLE: 'role',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceInviteMessageForm = Form<
    InputID,
    {
        [INPUT_IDS.WELCOME_MESSAGE]: string;
        [INPUT_IDS.ROLE]: string;
    }
>;

export type {WorkspaceInviteMessageForm};
export default INPUT_IDS;
