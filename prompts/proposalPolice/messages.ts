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

/**
 * For a comment that claimed the job without proposing anything. It has no proposal to update, so the
 * reminder above would thank the author for work they didn't do.
 */
function buildJobClaimReminderMessage(commentAuthor: string | undefined): string {
    return `⚠️ @${commentAuthor} Thanks for your interest. To be considered for this job, please post a proposal following the [proposal template](https://github.com/Expensify/App/blob/main/contributingGuides/PROPOSAL_TEMPLATE.md?plain=1) (note the mandatory sections). Comments claiming the job without one are not reviewed.`;
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
    buildJobClaimReminderMessage,
    buildSubstantiveEditMessage,
    buildDuplicateCheckNoticeMessage,
};
