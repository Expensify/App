import type {InspectionEvent} from 'xstate';
import createBufferedObserver from './createBufferedObserver';
import createDeferredStart from './createDeferredStart';
import type {LoadedInspector} from './types';
import type XStateInspector from './types';

/**
 * Builds the dev-only inspector handle. The dynamic `import()` calls stay inline under the `__DEV__`
 * guard so that a production build, where `__DEV__` is `false`, leaves out the inspector and its helpers
 * entirely, with no leftover async chunks. Do not move them into a helper function, because webpack
 * walks every declared function body and would emit those chunks even when the helper is never called.
 */
function createXStateInspector(): XStateInspector {
    if (!__DEV__) {
        return {inspect: undefined};
    }

    const ready: Promise<LoadedInspector> = Promise.all([import('@statelyai/inspect'), import('./maskSensitive'), import('./filterGhostActorRegistrations')]).then(
        ([{createBrowserInspector}, {maskInspectionEvent}, {default: filterGhostActorRegistrations}]) => {
            // `autoStart: false` keeps the window closed until `start()` runs from the dev-menu button.
            // Events sent before then are buffered, so none are lost.
            const inspector = createBrowserInspector({
                autoStart: false,
                serialize: maskInspectionEvent,
            });
            return {
                inspect: filterGhostActorRegistrations(inspector.inspect),
                start: () => inspector.start(),
            };
        },
    );

    return {
        inspect: createBufferedObserver<InspectionEvent>(ready.then((inspector) => inspector.inspect)),
        start: createDeferredStart(ready),
    };
}

/**
 * The dev-only Stately inspector. Pass `xstateInspector.inspect` to any actor, through `useMachine` or
 * `createActor`, to visualize its states, transitions, and context at stately.ai/inspect, where
 * sensitive fields are masked (see `maskSensitive.ts`). A single shared window shows every wired
 * machine. Prefer the `useInspectedMachine` hook, which wires this up for you.
 */
const xstateInspector = createXStateInspector();

export default xstateInspector;
