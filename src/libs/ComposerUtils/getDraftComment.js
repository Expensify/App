import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

const draftCommentMap = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    callback: (value, key) => {
        const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '');
        draftCommentMap[reportID] = value;
    },
});

/**
 * Returns a draft comment from the onyx collection.
 * @param {String} reportID
 * @returns {String|undefined}
 */
export default function getDraftComment(reportID) {
    return draftCommentMap[reportID];
}
