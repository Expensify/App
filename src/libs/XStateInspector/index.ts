import type {createBrowserInspector as createBrowserInspectorFn} from '@statelyai/inspect';
import type {filterGhostActorRegistrations as filterGhostActorRegistrationsFn} from './filterGhostActorRegistrations';
import type {maskInspectionEvent as maskInspectionEventFn} from './maskSensitive';
import type XStateInspector from './types';

function createXStateInspector(): XStateInspector {
    if (!__DEV__) {
        return {inspect: undefined};
    }

    // Guarded requires instead of static imports so webpack drops these modules from production bundles together with this dead branch.
    // require() returns `any`; the assertions restore the modules' real shapes via the type-only imports above (which webpack erases).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {createBrowserInspector} = require('@statelyai/inspect') as {createBrowserInspector: typeof createBrowserInspectorFn};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {maskInspectionEvent} = require('./maskSensitive') as {maskInspectionEvent: typeof maskInspectionEventFn};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {filterGhostActorRegistrations} = require('./filterGhostActorRegistrations') as {filterGhostActorRegistrations: typeof filterGhostActorRegistrationsFn};

    // autoStart: false defers window.open until `start()` (the dev-menu button); events sent before
    // that are buffered by the inspector (maxDeferredEvents) and flushed once the window opens.
    // `serialize` replaces the default serializer as the single outbound gate: it masks the whole
    // event, including the snapshot `input`/`output`/`error` fields that the narrower
    // `sanitizeContext`/`sanitizeEvent` hooks never see.
    const inspector = createBrowserInspector({
        autoStart: false,
        serialize: maskInspectionEvent,
    });

    return {
        // The filter keeps actors created in render passes React threw away (and thus never
        // started) out of the inspector; without it every such ghost shows up as a duplicate
        // machine forever stuck in its initial state.
        inspect: filterGhostActorRegistrations(inspector.inspect),
        start: () => inspector.start(),
    };
}

/**
 * Dev-only Stately Inspector. Pass `xstateInspector.inspect` to any actor (`useMachine`/`createActor`)
 * to visualize its states, transitions and context (sensitive fields masked, see `maskSensitive.ts`)
 * at stately.ai/inspect; the single shared window shows every wired machine. Prefer the
 * `useInspectedMachine` hook, which wires this up.
 */
const xstateInspector = createXStateInspector();

export default xstateInspector;
