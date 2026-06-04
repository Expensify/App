import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    PROMPT: 'prompt',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type EditAgentPromptForm = Form<
    InputID,
    {
        [INPUT_IDS.PROMPT]: string;
    }
>;

export type {EditAgentPromptForm};
export default INPUT_IDS;
