import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    WELCOME_MESSAGE: 'welcomeMessage',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceInviteMessageForm = Form<
    InputID,
    {
        [INPUT_IDS.WELCOME_MESSAGE]: string;
    }
>;

export type {WorkspaceInviteMessageForm};
export default INPUT_IDS;
