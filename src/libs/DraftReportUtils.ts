import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

/**
 * A singleton class to manage the draft report IDs
 * @class DraftReportUtils
 * @singleton
 */
class DraftReportUtils {
    private static instance: DraftReportUtils;

    private draftReportIDs: Record<string, boolean>;

    private constructor() {
        DraftReportUtils.instance = this;

        this.draftReportIDs = {};

        this.subscribeToDraftReportIDs();
    }

    /**
     * @returns The singleton instance
     */
    public static getInstance(): DraftReportUtils {
        // Ensure singleton instance
        return DraftReportUtils.instance ?? new DraftReportUtils();
    }

    /**
     * Subscribe to the draft report IDs
     */
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

    /**
     * @returns The draft report IDs
     */
    getDraftReportIDs() {
        return this.draftReportIDs;
    }
}

export default DraftReportUtils;
