/** The Wise onboarding pages that have not saved yet, by step. Each map is cleared by different events, so they are kept apart. */
type WiseOnboardingUnsavedPages = {
    /** The pages whose last save has not succeeded, as when it is running or failed. The shared `errors` hold only the newest failure, so these keep Confirm blocked until each page saves. */
    saveNotSucceeded?: Record<string, boolean>;

    /** The pages the user left offline, whose answers are only in the draft. A later save of the page clears its mark, while the success of an older save does not. */
    leftOffline?: Record<string, boolean>;
};

export default WiseOnboardingUnsavedPages;
