type PreInsertTiming = 'idle' | number;
type AfterTransition = () => void;

type UsePreMountDestinationOptions = {
    /** When false, skips narrow-layout pre-insert on mount. reveal() still works. Defaults to true. */
    preInsert?: boolean;

    /**
     * Controls how narrow-layout pre-insert is scheduled after the hook is allowed to run.
     * Use `idle` for new flows. Pass a number of milliseconds only to mirror current
     * timeout-based pre-insert call sites until they are migrated.
     */
    preInsertTiming?: PreInsertTiming;

    /**
     * When true on unmount, the pre-inserted route is preserved (e.g. the user submitted
     * and the caller dismisses the modal separately). Used by flows where reveal() is not
     * invoked directly from the same component that owns the hook. If the preserve condition
     * can change in the same update that unmounts this hook, read it from a ref inside this callback.
     */
    shouldPreservePreInsertedRouteOnUnmount?: () => boolean;
};

type UsePreMountDestinationResult = {
    /**
     * Default reveal: dismiss over a pre-inserted narrow route, otherwise revealRouteBeforeDismissingModal.
     * Covers handleDismissToReport, ShareDetailsPage, dismissWideToNewReport, and navigateAfterExpenseCreate wide path.
     */
    reveal: (afterTransition?: AfterTransition) => void;

    /**
     * Removes a pre-inserted route while the RHP is still on top. Call explicitly on back-out
     * before closing the RHP (IOURequestStartPage.navigateBack).
     */
    cleanupPreMount: () => void;
};

export type {AfterTransition, UsePreMountDestinationOptions, UsePreMountDestinationResult};
