/**
 * HybridApp NVP
 */
type TryNewDot = {
    /**
     * This key is mostly used on OldDot. In NewDot, we only use `completedHybridAppOnboarding` and `isLockedToNewDot`.
     */
    classicRedirect?: {
        /**
         * Indicates if transition from OldDot to NewDot should happen in HybridApp.
         */
        dismissed: boolean;
        /**
         * Indicates timestamp of an action.
         */
        timestamp: Date;

        /**
         * Indicates if explanation modal on NewDot was dismissed.
         */
        completedHybridAppOnboarding: boolean;

        /**
         * Indicates whether the user has access to the OldDot transition.
         */
        isLockedToNewDot?: boolean;
    };
    /**
     * This key is added when user is migrated from OldDot to NewDot with nudge migration as part of a cohort.
     */
    nudgeMigration?: {
        /** Indicates timestamp of an action. */
        timestamp: Date;
    };
};

export default TryNewDot;
