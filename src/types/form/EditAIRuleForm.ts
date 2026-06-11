import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    PROMPT: 'prompt',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type EditAIRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.PROMPT]: string;
    }
>;

export type {EditAIRuleForm};
export default INPUT_IDS;
