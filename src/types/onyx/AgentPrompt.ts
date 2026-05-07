import type {Errors, OnyxValueWithOfflineFeedback} from './OnyxCommon';

/** Model of an agent's prompt data stored as a shared NVP */
type AgentPrompt = OnyxValueWithOfflineFeedback<{
    /** The system prompt defining the agent's behavior */
    prompt: string;

    /** Errors from the last failed action */
    errors?: Errors | null;
}>;

export default AgentPrompt;
