/**
 * Schedule a call flow darft
 */
type ScheduleCallDraft = {
    /**
     * Date for the call
     */
    date?: string;
    /**
     * Time of the day of the guide that is being booked for the call
     */
    timeSlot?: string | null;
    /**
     * Guide details to whom call has been booked
     */
    guide?: {
        /**
         * AccountID of Guide
         */
        accountID: number;
        /**
         * Email of Guide
         */
        email: string;

        /**
         * Calendly URL for guide's schedule
         */
        scheduleURL: string;
    };

    /**
     * Admins room for which the call is being scheduled
     */
    reportID?: string;
};

export default ScheduleCallDraft;
