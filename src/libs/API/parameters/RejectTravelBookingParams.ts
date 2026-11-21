type RejectTravelBookingParams = {
    /** The trip room the booking belongs to */
    reportID: string;

    pnrID: string;

    /** Spotnana takes no reason, so the backend posts it as a comment in the trip room */
    reason?: string;

    /** The ID of the reason comment the client adds optimistically, sent only with a reason */
    reasonReportActionID?: string;
};

export default RejectTravelBookingParams;
