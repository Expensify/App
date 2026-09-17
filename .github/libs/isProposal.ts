import CONST from './CONST';

/**
 * Checks if a comment body matches the criteria for a Proposal.
 */
function isProposal(body: string | null | undefined): boolean {
    if (!body) {
        return false;
    }
    const lowerCaseBody = body.toLowerCase();
    return lowerCaseBody.includes(CONST.PROPOSAL_KEYWORD.toLowerCase()) && lowerCaseBody.includes(CONST.PROPOSAL_HEADER_A) && lowerCaseBody.includes(CONST.PROPOSAL_HEADER_B);
}

export default isProposal;
