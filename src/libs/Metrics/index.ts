import CONFIG from '@src/CONFIG';
import type {CanCaptureOnyxMetrics, CanCapturePerformanceMetrics} from './types';

// We don't capture performance metrics on web as there are enough tools available
const canCapturePerformanceMetrics: CanCapturePerformanceMetrics = () => false;

const canCaptureOnyxMetrics: CanCaptureOnyxMetrics = () => CONFIG.ONYX_METRICS;

export {canCapturePerformanceMetrics, canCaptureOnyxMetrics};
