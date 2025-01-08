import crashlytics from '@react-native-firebase/crashlytics';
import * as Metrics from '@libs/Metrics';
import Performance from '@libs/Performance';
import CONFIG from '@src/CONFIG';

export default function () {
    // We do not want to send crash reports if we are on a locally built release version of the app.
    // Crashlytics is disabled by default for debug builds, but not local release builds so we are using
    // an environment variable to enable them in the staging & production apps and opt-out everywhere else.
    if (!CONFIG.SEND_CRASH_REPORTS) {
        crashlytics().setCrashlyticsCollectionEnabled(false);
    }

    if (Metrics.canCapturePerformanceMetrics()) {
        Performance.enableMonitoring();
    }
}
