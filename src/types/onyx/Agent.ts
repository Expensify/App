import type {Errors, OnyxValueWithOfflineFeedback} from './OnyxCommon';

/** Agent model */
type Agent = OnyxValueWithOfflineFeedback<{
    /** The system prompt defining the agent's behavior */
    prompt: string;

    /** Errors from the last failed action */
    errors?: Errors | null;

    /** Errors specific to updating the agent name */
    nameErrors?: Errors | null;

    /** Errors specific to updating the agent prompt */
    promptErrors?: Errors | null;

    /** Errors specific to updating the agent avatar */
    avatarErrors?: Errors | null;
}>;

export default Agent;
