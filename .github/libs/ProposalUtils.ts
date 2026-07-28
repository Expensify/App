import CONST from './CONST';

/**
 * Checks if a comment body matches the criteria for a Proposal.
 */
function getIsProposal(body: string | null | undefined): boolean {
    if (!body) {
        return false;
    }
    const lowerCaseBody = body.toLowerCase();
    return body.includes(CONST.PROPOSAL_KEYWORD) && lowerCaseBody.includes(CONST.PROPOSAL_HEADER_A) && lowerCaseBody.includes(CONST.PROPOSAL_HEADER_B);
}

/**
 * Determines if a comment author is a known bot or a bot-type account.
 */
function getIsBotAuthor(user: {login?: string; type?: string} | null | undefined): boolean {
    if (!user) {
        return false;
    }

    const knownBotLogins: string[] = [CONST.COMMENT.NAME_MELVIN_BOT, CONST.COMMENT.NAME_MELVIN_USER, CONST.COMMENT.NAME_CODEX, CONST.COMMENT.NAME_GITHUB_ACTIONS];

    const isKnownBotLogin = knownBotLogins.includes(user.login ?? '');
    const isBotType = user.type === CONST.COMMENT.TYPE_BOT;

    return isKnownBotLogin || isBotType;
}

export {getIsProposal, getIsBotAuthor};
