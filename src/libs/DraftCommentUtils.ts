/**
 * Returns true if the report has a valid draft comment.
 * A valid draft comment is a non-empty string.
 */
function isValidDraftComment(comment?: string): boolean {
    return !!comment;
}

/**
 * Returns true if the report has a valid draft comment.
 */
function hasValidDraftComment(reportID: string, draftComment: string | undefined): boolean {
    return isValidDraftComment(draftComment);
}

/**
 * Prepares a draft comment by returning null if it's empty.
 */
function prepareDraftComment(comment: string | null) {
    // logical OR is used to convert empty string to null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return comment || null;
}

export {isValidDraftComment, hasValidDraftComment, prepareDraftComment};
