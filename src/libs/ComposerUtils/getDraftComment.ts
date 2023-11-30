import Onyx, {OnyxEntry} from 'react-native-onyx';
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
 * Returns a draft comment from the onyx collection.
 * Note: You should use the HOCs/hooks to get onyx data, instead of using this directly.
 * A valid use case to use this is if the value is only needed once for an initial value.
 */
export default function getDraftComment(reportID: string): OnyxEntry<string> {
    return draftCommentMap[reportID];
}
