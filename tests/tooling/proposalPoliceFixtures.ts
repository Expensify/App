/**
 * Shared fixtures for the ProposalPolice suites, so a change to what a valid proposal looks like or to the
 * fields the action reads off a comment lands in one place.
 */
import type {ProposalComment} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';

const VALID_PROPOSAL_BODY = [
    '## Proposal',
    '',
    '### What is the root cause of that problem?',
    'Some root cause',
    '',
    '### What changes do you think we should make in order to solve the problem?',
    'Some solution',
].join('\n');

/* eslint-disable @typescript-eslint/naming-convention -- these match GitHub's REST API field names */
type CommentOverrides = Partial<{id: number; body: string; login: string; type: string; created_at: string; html_url: string; node_id: string}>;

function makeComment(overrides: CommentOverrides = {}): ProposalComment {
    const id = overrides.id ?? 1;
    return {
        id,
        body: overrides.body ?? VALID_PROPOSAL_BODY,
        user: {login: overrides.login ?? 'contributor', type: overrides.type ?? 'User'},
        created_at: overrides.created_at ?? '2026-01-01T00:00:00Z',
        html_url: overrides.html_url ?? `https://github.com/Expensify/App/issues/1#issuecomment-${id}`,
        node_id: overrides.node_id ?? `IC_node_${id}`,
    };
}

/* eslint-enable @typescript-eslint/naming-convention */

export {VALID_PROPOSAL_BODY, makeComment};
export type {CommentOverrides};
