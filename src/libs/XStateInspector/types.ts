import type {InspectionEvent, Observer} from 'xstate';

/**
 * The resolved handle for the dynamically imported Stately inspector. Both `inspect`, the observer
 * wired into actors, and `start`, which opens the visualizer window, exist only once the inspector
 * chunk has loaded, which is why they arrive together through a promise.
 */
type LoadedInspector = {
    inspect: Observer<InspectionEvent>;
    start: () => void;
};

/**
 * A dev-only handle for the Stately inspector. The `inspect` observer is wired into an actor when
 * the actor is created, and it must already exist before the first event so that the full history is
 * captured. The `ready` promise resolves once the inspector chunk has loaded, and it is undefined
 * wherever the inspector cannot run, such as in production, on native, or in tests.
 */
type XStateInspector = {
    inspect: Observer<InspectionEvent> | undefined;
    ready?: Promise<LoadedInspector | null>;
};

export default XStateInspector;
export type {LoadedInspector};
