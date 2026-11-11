import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';

import type {ValueOf} from 'type-fest';

import type * as OnyxCommon from './OnyxCommon';
import type {TripData} from './TripData';

/**
 * Model for scheduled called on the report
 */
type CalendlyCall = {
    status: ValueOf<typeof CONST.SCHEDULE_CALL_STATUS>;

    /** The account executive the user confirmed the call with */
    host: number;

    /** The selected date and time in YYYY-MM-DD HH:MM:SS format for the call */
    eventTime: string;

    eventURI: string;

    /** The time the call was inserted in this NVP in YYYY-MM-DD HH:MM:SS format */
    inserted: string;
};

/** An approver of a travel booking, as Spotnana sent it */
type BookingApprover = {
    /** Name from Spotnana, which may differ from the Expensify display name */
    name: string;

    /** Email from Spotnana, which may not be an Expensify login */
    email: string;

    /** The approver's Spotnana user ID */
    spotnanaUserID: string;
};

/** The approval state of one travel booking */
type BookingApproval = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Where the booking is in its approval */
    status: ValueOf<typeof CONST.TRAVEL.BOOKING_APPROVAL.STATUS>;

    /** Spotnana's approval type */
    approvalType: ValueOf<typeof CONST.TRAVEL.BOOKING_APPROVAL.TYPE>;

    /** Spotnana's approval ID, needed to send a decision */
    approvalID: string;

    /** Approvers as Spotnana knows them; `approverAccountIDs` holds their Expensify accounts */
    approvers?: BookingApprover[];

    /** The approvers' Expensify accounts */
    approverAccountIDs?: number[];

    /** Spotnana's deadline: a local time and the time zone it is in */
    deadline?: {
        /** The deadline's local time, without an offset */
        iso8601: string;

        /** The time zone of the deadline */
        zoneId: string;
    };

    /** The webhook time of the last event applied */
    timestamp?: string;

    /** Who approved or rejected the booking in Expensify */
    decidedByAccountID?: number;

    /** Errors from approving or rejecting the booking */
    errors?: OnyxCommon.Errors;
}>;

/** The approval state of a trip's bookings, keyed by pnrID */
type BookingApprovalState = Record<string, BookingApproval>;

/**
 * Guide call schedule
 */
type GuideCalendlySchedule = {
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

    /** Identifies where the report originated from */
    origin?: string;

    /** Original reportID that spawned the current report */
    originalID?: string;

    /** On an invoice, the reportID of the bill linked to it. Auth sends it as a number, and an empty value means no bill. */
    billID?: string | number;

    /** The follow-up support ticket created after this ticket was reopened */
    reopenedAsReportID?: string;

    /** Set on a thread the backend opened to collect feedback on a Concierge answer, naming the rated action */
    conciergeFeedbackForReportActionID?: string;

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

    exportFailedTime?: string;

    /**
     * Agent Zero processing-indicator labels, keyed by the persona accountID (Concierge or a
     * custom agent) so a room with several agents shows one bubble per actively-thinking agent.
     * Each value is the status string for that agent. A null value clears that agent's slot during
     * local Onyx merge transitions. A legacy scalar string may still arrive during a backend/client
     * deploy overlap and is attributed to Concierge.
     */
    agentZeroProcessingRequestIndicator?: Record<string, string | null> | string;

    parentReportID?: string;

    /** The trip data for a trip room */
    tripData?: {
        /** The start date of a trip */
        startDate?: string;

        /** The end date of a trip */
        endDate?: string;

        /** The trip ID in Spotnana */
        tripID: string;

        payload?: TripData;

        /** Keyed by pnrID; missing when no booking in the trip needs approval */
        bookingApprovalState?: BookingApprovalState;
    };

    /** Title field configuration copied from policy - presence indicates auto-generated names are allowed */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    expensify_text_title?: {
        name: string;

        /** Default value assigned to the field */
        defaultValue: string;

        fieldID: string;

        /** Position at which the field should show up relative to the other fields */
        orderWeight: number;

        /** Type of report field */
        type: string;

        /** Tells if the field is required or not */
        deletable: boolean;

        value?: string | null;
        target?: 'expense' | 'invoice' | 'paycheck';

        /** Options to select from if field is of type dropdown */
        values: string[];

        /** Tax UDFs have keys holding the names of taxes (eg, VAT), values holding percentages (eg, 15%) and a value indicating the currently selected tax value (eg, 15%). */
        keys: string[];

        /** list of externalIDs, this are either imported from the integrations or auto generated by us, each externalID */
        externalIDs: string[];

        /** Collection of flags that state whether drop down field options are disabled */
        disabledOptions: boolean[];

        /** Is this a tax user defined report field */
        isTax: boolean;

        /** This is the selected externalID in an expense. */
        externalID?: string | null;

        /** Automated action or integration that added this report field */
        origin?: string | null;

        /** This is indicates which default value we should use. It was preferred using this over having defaultValue (which we have anyway for historical reasons), since the values are not unique we can't determine which key the defaultValue is referring too. It was also preferred over having defaultKey since the keys are user editable and can be changed. The externalIDs work effectively as an ID, which never changes even after changing the key, value or position of the option. */
        defaultExternalID?: string | null;
    };
}>;

/** Collection of reportNameValuePairs, indexed by reportNameValuePairs_{reportID} */
type ReportNameValuePairsCollectionDataSet = CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>;

export default ReportNameValuePairs;

export type {ReportNameValuePairsCollectionDataSet, CalendlyCall, BookingApproval};
