import type {InspectionEvent, Observer} from 'xstate';

/**
 * Dev-only Stately Inspector handle. `inspect` is wired into an actor at creation (it must exist
 * before the first event to capture the full history); `start` opens the visualizer window on demand
 * and is undefined wherever the inspector cannot run (production, native, tests).
 */
type XStateInspector = {
    inspect: Observer<InspectionEvent> | undefined;
    start?: () => void;
};

export default XStateInspector;
