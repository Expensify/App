import type XStateInspector from './types';

// The Stately Browser Inspector opens a second browser window via window.open, which does not exist
// on native. Resolving to this stub keeps @statelyai/inspect out of native (and Jest) bundles entirely.
const xstateInspector: XStateInspector = {inspect: undefined};

export default xstateInspector;
