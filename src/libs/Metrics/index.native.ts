import CONFIG from '../../CONFIG';
import Metrics from './types';

/**
 * Is capturing performance stats enabled.
 */
const canCapturePerformanceMetrics: Metrics['canCapturePerformanceMetrics'] = () => CONFIG.CAPTURE_METRICS;

/**
 * Is capturing Onyx stats enabled.
 */
const canCaptureOnyxMetrics: Metrics['canCaptureOnyxMetrics'] = () => CONFIG.ONYX_METRICS;

export {canCapturePerformanceMetrics, canCaptureOnyxMetrics};
