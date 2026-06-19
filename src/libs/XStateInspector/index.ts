import type {createBrowserInspector as createBrowserInspectorFn} from '@statelyai/inspect';
import type {filterGhostActorRegistrations as filterGhostActorRegistrationsFn} from './filterGhostActorRegistrations';
import type {maskInspectionEvent as maskInspectionEventFn} from './maskSensitive';
import type XStateInspector from './types';

function createXStateInspector(): XStateInspector {
    if (!__DEV__) {
        return {inspect: undefined};
    }

    // These modules are pulled in with require() inside the dev-only branch rather than with static
    // imports, so that webpack drops them from production bundles together with this dead branch.
    // Because require() returns `any`, the type assertions restore each module's real shape from the
    // type-only imports above, which webpack erases.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {createBrowserInspector} = require('@statelyai/inspect') as {createBrowserInspector: typeof createBrowserInspectorFn};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {maskInspectionEvent} = require('./maskSensitive') as {maskInspectionEvent: typeof maskInspectionEventFn};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {filterGhostActorRegistrations} = require('./filterGhostActorRegistrations') as {filterGhostActorRegistrations: typeof filterGhostActorRegistrationsFn};

    // With `autoStart: false` the window opens only when `start()` runs, which is the dev-menu
    // button. Events sent before that wait in the inspector buffer (`maxDeferredEvents`) and are
    // sent once the window opens. The `serialize` option replaces the default serializer and runs on
    // every outgoing event, so it masks the whole event. That includes the snapshot `input`,
    // `output`, and `error` fields that the narrower `sanitizeContext` and `sanitizeEvent` hooks
    // never see.
    const inspector = createBrowserInspector({
        autoStart: false,
        serialize: maskInspectionEvent,
    });

    return {
        inspect: filterGhostActorRegistrations(inspector.inspect),
        start: () => inspector.start(),
    };
}

/**
 * The dev-only Stately inspector. Pass `xstateInspector.inspect` to any actor, through `useMachine`
 * or `createActor`, to visualize its states, transitions, and context at stately.ai/inspect, where
 * sensitive fields are masked (see `maskSensitive.ts`). A single shared window shows every wired
 * machine. Prefer the `useInspectedMachine` hook, which wires this up for you.
 */
const xstateInspector = createXStateInspector();

export default xstateInspector;
