/** Model of the Chronos time-tracking NVP (expensify_chronosTimeTracking) */
type ChronosTimeTracking = {
    /** Timer start time in DB format; empty string when no timer is running */
    startTime?: string;

    timerWasTrackedManually?: string;
    lastStopTime?: string;

    /** Last time the 10am status was posted */
    last10amPosted?: string;
};

export default ChronosTimeTracking;
