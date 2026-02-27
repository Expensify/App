import {getCrashlytics, setCrashlyticsCollectionEnabled} from '@react-native-firebase/crashlytics';
import canCapturePerformanceMetrics from '@libs/Metrics';
import Performance from '@libs/Performance';
import CONFIG from '@src/CONFIG';

const crashlytics = getCrashlytics();

export default function () {
    // We do not want to send crash reports if we are on a locally built release version of the app.
    // Crashlytics is disabled by default for debug builds, but not local release builds so we are using
    // an environment variable to enable them in the staging & production apps and opt-out everywhere else.
    if (!CONFIG.SEND_CRASH_REPORTS) {
        setCrashlyticsCollectionEnabled(crashlytics, false);
    }

    if (canCapturePerformanceMetrics()) {
        Performance.enableMonitoring();
    }
}
