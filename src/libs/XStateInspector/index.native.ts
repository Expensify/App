import type XStateInspector from './types';

// The Stately browser inspector opens a second window through `window.open`, which does not exist on
// native. The bundler resolves to this stub there instead, which also keeps `@statelyai/inspect` out
// of the native and Jest bundles entirely.
const xstateInspector: XStateInspector = {inspect: undefined};

export default xstateInspector;
