import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const draftCommentMap: Record<string, OnyxEntry<string>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    callback: (value, key) => {
        if (!key) {
            return;
        }

        const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '');
        draftCommentMap[reportID] = value;
    },
});

/**
 * Returns a draft comment from the onyx collection for given reportID.
 * Note: You should use the HOCs/hooks to get onyx data, instead of using this directly.
 * A valid use-case of this function is outside React components, like in utility functions.
 */
function getDraftComment(reportID: string): OnyxEntry<string> {
    return draftCommentMap[reportID];
}

/**
 * Returns true if the report has a valid draft comment.
 * A valid draft comment is a non-empty string.
 */
function isValidDraftComment(comment?: string | null): boolean {
    return !!comment?.trim();
}

/**
 * Returns true if the report has a valid draft comment.
 */
function hasValidDraftComment(reportID: string): boolean {
    return isValidDraftComment(getDraftComment(reportID));
}

export {getDraftComment, isValidDraftComment, hasValidDraftComment};
