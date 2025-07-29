import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DraftReportComments} from '@src/types/onyx';

let draftComments: OnyxEntry<DraftReportComments> = {};
Onyx.connect({
    key: ONYXKEYS.NVP_DRAFT_REPORT_COMMENTS,
    callback: (nextVal) => {
        draftComments = nextVal;
    },
});

/**
 * Returns a draft comment from the onyx collection for given reportID.
 * Note: You should use the HOCs/hooks to get onyx data, instead of using this directly.
 * A valid use-case of this function is outside React components, like in utility functions.
 */
function getDraftComment(reportID: string): OnyxEntry<string> | null | undefined {
    return draftComments?.[reportID];
}

/**
 * Returns true if the report has a valid draft comment.
 * NOTE: please prefer useOnyx when possible
 */
function hasValidDraftComment(reportID: string): boolean {
    return !!getDraftComment(reportID);
}

/**
 * Prepares a draft comment by returning null if it's empty.
 */
function prepareDraftComment(comment: string | null) {
    // logical OR is used to convert empty string to null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return comment || null;
}

export {getDraftComment, hasValidDraftComment, prepareDraftComment};
