import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CUSTOM_PROMPT: 'customPrompt',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type CustomApprovalWorkflowForm = Form<
    InputID,
    {
        [INPUT_IDS.CUSTOM_PROMPT]: string;
    }
>;

export type {CustomApprovalWorkflowForm};
export default INPUT_IDS;
