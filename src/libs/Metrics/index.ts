import CONFIG from '../../CONFIG';
import Metrics from './types';

// We don't capture performance metrics on web as there are enough tools available
const canCapturePerformanceMetrics: Metrics['canCapturePerformanceMetrics'] = () => false;

const canCaptureOnyxMetrics: Metrics['canCaptureOnyxMetrics'] = () => CONFIG.ONYX_METRICS;

export {canCapturePerformanceMetrics, canCaptureOnyxMetrics};
