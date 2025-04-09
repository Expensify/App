/**
 * Schedule a call flow darft
 */
type ScheduleCallDraft = {
    /**
     *
     */
    date?: string;
    /**
     *
     */
    slotTime?: string;
    /**
     *
     */
    guide?: {
        /**
         *
         */
        accountID: number;
        /**
         *
         */
        email: string;

        /**
         *
         */
        scheduleUrl: string;
    };

    /**
     *
     */
    reportID?: string;
};

export default ScheduleCallDraft;
