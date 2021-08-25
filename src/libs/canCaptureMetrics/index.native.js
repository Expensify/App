import CONFIG from '../../CONFIG';

/**
 * Is capturing performance stats enabled.
 *
 * @returns {Boolean}
 */
export const canCapturePerformanceMetrics = () => Boolean(CONFIG.CAPTURE_METRICS);

/**
 * Is capturing Onyx stats enabled.
 *
 * @returns {Boolean}
 */
export const canCaptureOnyxMetrics = () => Boolean(CONFIG.ONYX_METRICS);
