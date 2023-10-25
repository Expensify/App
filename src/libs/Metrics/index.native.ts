import CONFIG from '../../CONFIG';
import {CanCaptureOnyxMetrics, CanCapturePerformanceMetrics} from './types';

/**
 * Is capturing performance stats enabled.
 */
const canCapturePerformanceMetrics: CanCapturePerformanceMetrics = () => CONFIG.CAPTURE_METRICS;

/**
 * Is capturing Onyx stats enabled.
 */
const canCaptureOnyxMetrics: CanCaptureOnyxMetrics = () => CONFIG.ONYX_METRICS;

export {canCapturePerformanceMetrics, canCaptureOnyxMetrics};
