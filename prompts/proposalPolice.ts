import CONST from '@github/libs/CONST';

const PROPOSAL_POLICE_TEMPLATES = {
    getPromptForNewProposalTemplateCheck: (commentBody: string): string => {
        return `I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ${commentBody}`;
    },
    getPromptForNewProposalDuplicateCheck: (newProposalBody: string | undefined, existingProposal: string): string => {
        return `I NEED HELP WITH CASE (3.) [INSTRUCTIONS SECTION: IX. DUPLICATE PROPOSAL DETECTION], COMPARE THE FOLLOWING TWO PROPOSALS AND RETURN A SIMILARITY PERCENTAGE (0-100) REPRESENTING HOW SIMILAR THESE TWO PROPOSALS ARE IN THOSE SECTIONS AS PER THE INSTRUCTIONS. \n\nProposal 1:\n${existingProposal}\n\nProposal 2:\n${newProposalBody}`;
    },
    getPromptForEditedProposal: (previousBody: string | undefined, editedBody: string): string => {
        return `I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ${previousBody}.\n\nEdited comment content: ${editedBody}`;
    },
    getDuplicateCheckWithdrawMessage: (): string => {
        return '#### 🚫 Duplicated proposal withdrawn by 🤖 ProposalPolice.';
    },
    getDuplicateCheckNoticeMessage: (proposalAuthor: string | undefined, originalProposalURL?: string): string => {
        const existingProposalWithURL = originalProposalURL ? `[existing proposal](${originalProposalURL})` : 'existing proposal';
        return `⚠️ @${proposalAuthor} Your proposal is a duplicate of an already ${existingProposalWithURL} and has been automatically withdrawn to prevent spam. Please review the existing proposals before submitting a new one.`;
    },
};

export default PROPOSAL_POLICE_TEMPLATES;
