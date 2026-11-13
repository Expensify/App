type ApproveTravelBookingsParams = {
    /** The trip room the bookings belong to */
    reportID: string;

    /** Only these bookings are approved, so a booking added after the approver looked isn't approved too */
    pnrIDs: string[];
};

export default ApproveTravelBookingsParams;
