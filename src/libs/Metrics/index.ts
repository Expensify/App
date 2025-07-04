import type CanCapturePerformanceMetrics from './types';

// We don't capture performance metrics on web as there are enough tools available
const canCapturePerformanceMetrics: CanCapturePerformanceMetrics = () => false;

export default canCapturePerformanceMetrics;
