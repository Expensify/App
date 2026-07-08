type AfterTransition = () => void;

type UsePreMountDestinationOptions = {
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
     * Run synchronous submit work and destination selection before calling this method.
     */
    reveal: (afterTransition?: AfterTransition) => void;

    /**
     * Removes a pre-inserted route while the RHP is still on top. Call explicitly on back-out
     * before closing the RHP without revealing the destination.
     */
    cleanupPreMount: () => void;
};

export type {AfterTransition, UsePreMountDestinationOptions, UsePreMountDestinationResult};
