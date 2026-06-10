import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    FIRST_NAME: 'firstName',
    PROMPT: 'prompt',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type AddAgentForm = Form<
    InputID,
    {
        [INPUT_IDS.FIRST_NAME]: string;
        [INPUT_IDS.PROMPT]: string;
    }
>;

export type {AddAgentForm};
export default INPUT_IDS;
