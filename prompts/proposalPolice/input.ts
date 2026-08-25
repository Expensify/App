import type {ResponseInputItem} from 'openai/resources/responses/responses';

/**
 * Escapes the characters that carry meaning in our XML-style wrapper tags, before untrusted
 * comment/proposal text is interpolated into them. Angle brackets so a body containing a literal
 * `</proposal>` can't be mistaken for the end of our own wrapper, and quotes so neither a body nor a
 * login can close an attribute and forge a `comment_id` or `author` the model would then believe.
 */
function escapeForXMLWrapper(text: string): string {
    return text.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

/**
 * Build the user input for a comment-intent request (a newly created comment).
 */
function buildCommentIntentInput(commentBody: string, isTrustedCommenter = false): string {
    const authorContext = isTrustedCommenter ? 'trusted: the commenter is an approved contributor or has identified themselves as working for an approved partner' : 'untrusted: no approved contributor or partner affiliation was verified';
    return [`<new_comment>\n${escapeForXMLWrapper(commentBody)}\n</new_comment>`, `<author_context>${authorContext}</author_context>`].join('\n');
}

/**
 * Build the user input for an edit-check request (an edited comment).
 */
function buildEditCheckInput(previousBody: string | undefined, editedBody: string): string {
    return ['<edit>', `<original>\n${escapeForXMLWrapper(previousBody ?? '')}\n</original>`, `<edited>\n${escapeForXMLWrapper(editedBody)}\n</edited>`, '</edit>'].join('\n');
}

/**
 * Build the user input for a duplicate-check request. The request is sent against the issue's
 * Conversation, so this text is persisted there and becomes one of the prior proposals a later request
 * compares against. It therefore uses the same tag as a seeded proposal: the model is told the last
 * message is the one under review, which keeps history uniform instead of leaving it strewn with
 * messages that each claim to be the new proposal.
 */
function buildDuplicateCheckInput(proposalBody: string, commentID: number, author: string): string {
    return `<proposal comment_id="${commentID}" author="${escapeForXMLWrapper(author)}">\n${escapeForXMLWrapper(proposalBody)}\n</proposal>`;
}

/**
 * Build a conversation item representing a prior proposal, used to seed a duplicate-check conversation
 * with proposals that predate it and to re-record one whose comment was edited.
 */
function buildDuplicateCheckSeedItem(proposalBody: string, commentID: number, author: string): ResponseInputItem {
    return {
        role: 'user',
        content: buildDuplicateCheckInput(proposalBody, commentID, author),
    };
}

export {buildCommentIntentInput, buildEditCheckInput, buildDuplicateCheckInput, buildDuplicateCheckSeedItem};
