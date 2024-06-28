/**
 * HybridApp NVP
 */
type TryNewDot = {
    /**
     * This key is mostly used on OldDot. In NewDot, we only use `completedHybridAppOnboarding`.
     */
    classicRedirect: {
        /**
         * Indicates if transistion from OldDot to NewDot should happen in HybridApp.
         */
        dismissed: boolean | string;
        /**
         * Indicates timestamp of an action.
         */
        timestamp: Date;

        /**
         * Indicates if explanation modal on NewDot was dismissed.
         */
        completedHybridAppOnboarding: boolean;
    };
};

export default TryNewDot;
