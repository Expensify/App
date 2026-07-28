import type {ResponseInputItem} from 'openai/resources/responses/responses';

/**
 * Escapes angle brackets in untrusted comment/proposal text before it's interpolated into our
 * XML-style wrapper tags, so a comment containing a literal `</new_proposal>` (or similar) can't be
 * mistaken by the model for the end of our own wrapper.
 */
function escapeForXMLWrapper(text: string): string {
    return text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
 * Build the user input for a template-check request (a newly created comment).
 */
function buildTemplateCheckInput(commentBody: string): string {
    return `<new_comment>\n${escapeForXMLWrapper(commentBody)}\n</new_comment>`;
}

/**
 * Build the user input for an edit-check request (an edited comment).
 */
function buildEditCheckInput(previousBody: string | undefined, editedBody: string): string {
    return ['<edit>', `<original>\n${escapeForXMLWrapper(previousBody ?? '')}\n</original>`, `<edited>\n${escapeForXMLWrapper(editedBody)}\n</edited>`, '</edit>'].join('\n');
}

/**
 * Build the user input for a duplicate-check request: the new proposal, tagged with its comment ID
 * so the model can report back which prior proposal (if any) it duplicates.
 */
function buildDuplicateCheckInput(newProposalBody: string, commentID: number): string {
    return `<new_proposal comment_id="${commentID}">\n${escapeForXMLWrapper(newProposalBody)}\n</new_proposal>`;
}

/**
 * Build a conversation item representing a prior proposal, used only to seed a duplicate-check
 * conversation with proposals that predate it.
 */
function buildDuplicateCheckSeedItem(proposalBody: string, commentID: number): ResponseInputItem {
    return {
        role: 'user',
        content: `<proposal comment_id="${commentID}">\n${escapeForXMLWrapper(proposalBody)}\n</proposal>`,
    };
}

export {buildTemplateCheckInput, buildEditCheckInput, buildDuplicateCheckInput, buildDuplicateCheckSeedItem};
