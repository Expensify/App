const NOOP = () => {};

/**
 * We are only emitting the scroll events on web, to trigger specific scroll behavior in the composer.
 * Therefore, on native this is a no-op.
 */
function useEmitComposerScrollEvents() {
    return NOOP;
}

export default useEmitComposerScrollEvents;
