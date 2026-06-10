import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    PROMPT: 'prompt',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type AddAIRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.PROMPT]: string;
    }
>;

export type {AddAIRuleForm};
export default INPUT_IDS;
