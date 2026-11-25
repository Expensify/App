import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors, OnyxValueWithOfflineFeedback} from './OnyxCommon';

/** The agent owner account type */
type AgentOwnerType = ValueOf<typeof CONST.AGENTS.OWNER_TYPE>;

/** Agent model */
type Agent = OnyxValueWithOfflineFeedback<{
    /** The system prompt defining the agent's behavior */
    prompt: string;

    /** The agent owner account ID */
    ownerAccountID?: number;

    /** The agent owner account type (person, workspace or domain) */
    ownerType?: AgentOwnerType;

    /** Errors from the last failed action */
    errors?: Errors | null;

    /** Errors specific to updating the agent name */
    nameErrors?: Errors | null;

    /** Errors specific to updating the agent prompt */
    promptErrors?: Errors | null;

    /** Errors specific to updating the agent avatar */
    avatarErrors?: Errors | null;

    /** Only on a new agent's temporary record: the name to show while its personal details are missing in this tab */
    fallbackDisplayName?: string;

    /** Only on a new agent's temporary record: the avatar to show while its personal details are missing in this tab */
    fallbackAvatar?: string;
}>;

export type {AgentOwnerType};
export default Agent;
