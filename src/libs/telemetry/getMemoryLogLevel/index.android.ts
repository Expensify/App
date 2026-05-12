import type * as Sentry from '@sentry/react-native';
import type {MemoryInfo} from '@libs/telemetry/getMemoryInfo/types';
import CONST from '@src/CONST';

/**
 * Determine memory log level for Android platform based on device RAM percentage
 * @param memoryInfo - Memory information object
 * @returns Sentry severity level based on memory usage
 */
export default function getMemoryLogLevel(memoryInfo: MemoryInfo): Sentry.SeverityLevel {
    if (memoryInfo.usagePercentage !== null) {
        if (memoryInfo.usagePercentage > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_ANDROID_CRITICAL) {
            return 'error';
        }
        if (memoryInfo.usagePercentage > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_ANDROID_WARNING) {
            return 'warning';
        }
    }
    return 'info';
}
