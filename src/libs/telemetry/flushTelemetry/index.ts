import type FlushTelemetry from './types';

// The browser SDK already flushes its queue when the page becomes hidden, so web has nothing extra to do.
const flushTelemetry: FlushTelemetry = () => {};

export default flushTelemetry;
