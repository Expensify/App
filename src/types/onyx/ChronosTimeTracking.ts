/** Model of the Chronos time-tracking NVP (expensify_chronosTimeTracking) */
type ChronosTimeTracking = {
    /** Timer start time in DB format; empty string when no timer is running */
    startTime?: string;

    /** Whether the timer was tracked manually */
    timerWasTrackedManually?: string;

    /** Last time the timer was stopped */
    lastStopTime?: string;

    /** Last time the 10am status was posted */
    last10amPosted?: string;
};

export default ChronosTimeTracking;
