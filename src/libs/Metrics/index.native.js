import CONFIG from '../../CONFIG';

/**
 * Is capturing performance stats enabled.
 *
 * @returns {Boolean}
 */
const canCapturePerformanceMetrics = () => CONFIG.CAPTURE_METRICS;

/**
 * Is capturing Onyx stats enabled.
 *
 * @returns {Boolean}
 */
const canCaptureOnyxMetrics = () => CONFIG.ONYX_METRICS;

export {canCapturePerformanceMetrics, canCaptureOnyxMetrics};
