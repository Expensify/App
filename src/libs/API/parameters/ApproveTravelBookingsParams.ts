type ApproveTravelBookingsParams = {
    /** The trip room the bookings belong to */
    reportID: string;

    /** JSON array of the bookings to approve. Only these are approved, so a booking added after the approver looked isn't approved too */
    pnrIDs: string;
};

export default ApproveTravelBookingsParams;
