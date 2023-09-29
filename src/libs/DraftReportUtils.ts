import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

class DraftReportUtils {
    private static instance: DraftReportUtils;

    private draftReportIDs: Record<string, boolean>;

    private constructor() {
        DraftReportUtils.instance = this;

        this.draftReportIDs = {};

        this.subscribeToDraftReportIDs();
    }

    public static getInstance(): DraftReportUtils {
        // Ensure singleton instance
        return DraftReportUtils.instance ?? new DraftReportUtils();
    }

    private subscribeToDraftReportIDs() {
        Onyx.connect({
            key: ONYXKEYS.DRAFT_REPORT_IDS,
            callback: (val) => {
                if (!val) {
                    return;
                }

                this.draftReportIDs = val;
            },
        });
    }

    getDraftReportIDs() {
        return this.draftReportIDs;
    }
}

export default DraftReportUtils;
