import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxKey} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DraftReportComments} from '@src/types/onyx';

// moves individual drafts from `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}` to ONYXKEYS.NVP_DRAFT_REPORT_COMMENTS
export default function (): Promise<void> {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
            waitForCollectionCallback: true,
            callback: (drafts: OnyxCollection<string>) => {
                Onyx.disconnect(connection);

                if (!drafts) {
                    Log.info('[Migrate Onyx] Skipped migration MoveDraftsToNVP because there were no drafts');
                    return resolve();
                }

                const newDrafts: DraftReportComments = {};
                Object.entries(drafts).forEach(([reportOnyxKey, draft]) => {
                    if (!draft) {
                        return;
                    }
                    newDrafts[reportOnyxKey.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '')] = draft;
                    // eslint-disable-next-line rulesdir/prefer-actions-set-data
                    Onyx.set(reportOnyxKey as OnyxKey, null);
                });

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.set(ONYXKEYS.NVP_DRAFT_REPORT_COMMENTS, newDrafts);
                resolve();
            },
        });
    });
}
