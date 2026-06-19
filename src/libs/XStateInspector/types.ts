import type {InspectionEvent, Observer} from 'xstate';

/**
 * A dev-only handle for the Stately inspector. The `inspect` observer is wired into an actor when
 * the actor is created, and it must already exist before the first event so that the full history is
 * captured. The `start` function opens the visualizer window on demand, and it is undefined wherever
 * the inspector cannot run, such as in production, on native, or in tests.
 */
type XStateInspector = {
    inspect: Observer<InspectionEvent> | undefined;
    start?: () => void;
};

export default XStateInspector;
