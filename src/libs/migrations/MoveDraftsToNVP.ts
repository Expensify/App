import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxKey, OnyxMultiSetInput} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DraftReportComments} from '@src/types/onyx';

// moves individual drafts from `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}` to ONYXKEYS.NVP_DRAFT_REPORT_COMMENTS
export default function (): Promise<void> {
    return new Promise<void>((resolve) => {
        // eslint-disable-next-line rulesdir/no-onyx-connect
        const connection = Onyx.connect({
            // eslint-disable-next-line deprecation/deprecation
            key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
            waitForCollectionCallback: true,
            callback: (drafts: OnyxCollection<string>) => {
                Onyx.disconnect(connection);

                if (!drafts) {
                    Log.info('[Migrate Onyx] Skipped migration MoveDraftsToNVP because there were no drafts');
                    return resolve();
                }

                const newDrafts: DraftReportComments = {};
                const draftsToClear: OnyxMultiSetInput = {};
                for (const [reportOnyxKey, draft] of Object.entries(drafts)) {
                    if (!draft) {
                        continue;
                    }
                    // eslint-disable-next-line deprecation/deprecation
                    newDrafts[reportOnyxKey.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '')] = draft;
                    draftsToClear[reportOnyxKey as OnyxKey] = null;
                }

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.set(ONYXKEYS.NVP_DRAFT_REPORT_COMMENTS, newDrafts);

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.multiSet(draftsToClear);
                resolve();
            },
        });
    });
}
