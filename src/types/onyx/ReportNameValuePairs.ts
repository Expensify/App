import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import type * as OnyxCommon from './OnyxCommon';

/**
 * Model for scheduled called on the report
 */
type CalendlyCall = {
    /** Status of the call */
    status: ValueOf<typeof CONST.SCHEDULE_CALL_STATUS>;

    /** The setup specialist the user confirmed the call with */
    host: number;

    /** The selected date and time in YYYY-MM-DD HH:MM:SS format for the call */
    eventTime: string;

    /** Unique identifier of the event  */
    eventURI: string;

    /** The time the call was inserted in this NVP in YYYY-MM-DD HH:MM:SS format */
    inserted: string;
};

/**
 * Guide call schedule
 */
type GuideCalendlySchedule = {
    /**
     * Guide Email
     */
    guideEmail: string;
    /**
     * Available slots for the guide
     */
    timeSlots: Array<{
        /**
         * Calendly event scheduling url
         */
        schedulingURL: string;

        /**
         * Start time for the slow
         */
        startTime: string;
    }>;
};

/**
 * Guide Account ID
 */
type GuideAccountID = string;

/** Model of additional report details */
type ReportNameValuePairs = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Whether the report is an archived room */
    private_isArchived?: string;

    /** Scheduled calls for the user on #admin rooms */
    calendlyCalls?: CalendlyCall[];

    /** Guides Call schedule */
    calendlySchedule?: {
        /** Whether the API call is loading */
        isLoading?: boolean;

        /** Whether the account was merged successfully */
        data?: Record<GuideAccountID, GuideCalendlySchedule>;

        /** Errors while merging the account */
        errors?: OnyxCommon.Errors;
    };

    /** The time the report export failed */
    exportFailedTime?: string;
}>;

/** Collection of reportNameValuePairs, indexed by reportNameValuePairs_{reportID} */
type ReportNameValuePairsCollectionDataSet = CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>;

export default ReportNameValuePairs;

export type {ReportNameValuePairsCollectionDataSet, CalendlyCall};
