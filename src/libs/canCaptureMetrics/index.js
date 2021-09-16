import CONFIG from '../../CONFIG';

// We don't capture performance metrics on web as there are enough tools available
export const canCapturePerformanceMetrics = () => false;

export const canCaptureOnyxMetrics = () => Boolean(CONFIG.ONYX_METRICS);
