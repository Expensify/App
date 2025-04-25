type GetGuideCallAvailabilityScheduleParams = {
    /** Admins room policy Id */
    policyID: string;

    /** Month to get the availability for */
    month?: number;

    /** Admins room reportID */
    reportID: string;

    /** User Auth token */
    authToken: string;

    /** Account Id of the current user */
    accountID: number;
};

export default GetGuideCallAvailabilityScheduleParams;
