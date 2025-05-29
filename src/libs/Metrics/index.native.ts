import CONFIG from '@src/CONFIG';
import type CanCapturePerformanceMetrics from './types';

/**
 * Is capturing performance stats enabled.
 */
const canCapturePerformanceMetrics: CanCapturePerformanceMetrics = () => CONFIG.CAPTURE_METRICS;

export default canCapturePerformanceMetrics;
