import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type AfterTransition = () => void;
type DestinationStrategy = ValueOf<typeof CONST.DESTINATION_STRATEGY>;

type UsePreMountDestinationOptions = {
    /**
     * Controls how the destination is prepared.
     *
     * - CONST.DESTINATION_STRATEGY.PRE_INSERT: eagerly pre-mount the route (under the RHP on narrow, under the current
     *   fullscreen on wide layout), then reveal over it.
     * - CONST.DESTINATION_STRATEGY.REVEAL: skip eager pre-mount and insert/reveal the route when reveal() is called.
     *
     * If the hook already pre-inserted the destination, reveal() still reveals that owned route even if this option later
     * changes to REVEAL. Defaults to CONST.DESTINATION_STRATEGY.PRE_INSERT.
     */
    destinationStrategy?: DestinationStrategy;

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

export type {AfterTransition, DestinationStrategy, UsePreMountDestinationOptions, UsePreMountDestinationResult};
