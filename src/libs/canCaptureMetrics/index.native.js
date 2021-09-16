import CONFIG from '../../CONFIG';

/**
 * Is capturing performance stats enabled.
 *
 * @returns {Boolean}
 */
export const canCapturePerformanceMetrics = () => CONFIG.CAPTURE_METRICS;

/**
 * Is capturing Onyx stats enabled.
 *
 * @returns {Boolean}
 */
export const canCaptureOnyxMetrics = () => CONFIG.ONYX_METRICS;
