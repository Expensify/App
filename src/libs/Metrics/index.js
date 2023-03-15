import CONFIG from '../../CONFIG';

// We don't capture performance metrics on web as there are enough tools available
const canCapturePerformanceMetrics = () => false;

const canCaptureOnyxMetrics = () => Boolean(CONFIG.ONYX_METRICS);

export {canCapturePerformanceMetrics, canCaptureOnyxMetrics};
