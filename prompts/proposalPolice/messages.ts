/**
 * Every GitHub-facing message ProposalPolice posts. The model only decides *which* of these applies;
 * it never writes or echoes the text, so the wording here is what contributors actually see.
 */

const DUPLICATE_CHECK_WITHDRAW_MESSAGE = '#### 🚫 Duplicated proposal withdrawn by 🤖 ProposalPolice.';

/**
 * Marks a comment ProposalPolice has already flagged as substantively edited. Matched against comment
 * bodies to avoid flagging the same edit twice, so it must stay a literal prefix of the message below.
 */
const SUBSTANTIVE_EDIT_MESSAGE_PREFIX = '🚨 Edited by **proposal-police**:';

/**
 * Matches the banner a previous run prepended, along with the blank line separating it from the
 * proposal, so the proposal can be recovered from a comment that already carries one.
 * ProposalPoliceMessagesTest pins this against buildSubstantiveEditMessage so the two cannot drift.
 */
const SUBSTANTIVE_EDIT_MESSAGE_REGEX = /^🚨 Edited by \*\*proposal-police\*\*:[^\n]*\n+/;

function buildTemplateReminderMessage(proposalAuthor: string | undefined): string {
    return `⚠️ @${proposalAuthor} Thanks for your proposal. Please update it to follow the [proposal template](https://github.com/Expensify/App/blob/main/contributingGuides/PROPOSAL_TEMPLATE.md?plain=1), as proposals are only reviewed if they follow that format (note the mandatory sections).`;
}

function buildSubstantiveEditMessage(updatedTimestamp: string): string {
    return `${SUBSTANTIVE_EDIT_MESSAGE_PREFIX} This proposal was **edited** at ${updatedTimestamp}.`;
}

function buildDuplicateCheckNoticeMessage(proposalAuthor: string | undefined, originalProposalURL: string): string {
    return `⚠️ @${proposalAuthor} Your proposal is a duplicate of an already [existing proposal](${originalProposalURL}) and has been automatically withdrawn to prevent spam. Please review the existing proposals before submitting a new one.`;
}

export {
    DUPLICATE_CHECK_WITHDRAW_MESSAGE,
    SUBSTANTIVE_EDIT_MESSAGE_PREFIX,
    SUBSTANTIVE_EDIT_MESSAGE_REGEX,
    buildTemplateReminderMessage,
    buildSubstantiveEditMessage,
    buildDuplicateCheckNoticeMessage,
};
