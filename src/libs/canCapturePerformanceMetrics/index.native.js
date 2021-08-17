import CONFIG from '../../CONFIG';

/**
 * Enables capturing performance stats.
 *
 * @returns {Boolean}
 */
export default function canCapturePerformanceMetrics() {
    return Boolean(CONFIG.CAPTURE_METRICS);
}
