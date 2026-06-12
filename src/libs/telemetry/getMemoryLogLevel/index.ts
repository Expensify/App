import type * as Sentry from '@sentry/react-native';
import type {MemoryInfo} from '@libs/telemetry/getMemoryInfo/types';
import CONST from '@src/CONST';

/**
 * Determine memory log level for web platform based on JS heap percentage
 * @param memoryInfo - Memory information object
 * @returns Sentry severity level based on memory usage
 */
export default function getMemoryLogLevel(memoryInfo: MemoryInfo): Sentry.SeverityLevel {
    const usagePercent = memoryInfo.usedMemoryBytes !== null && memoryInfo.maxMemoryBytes !== null ? (memoryInfo.usedMemoryBytes / memoryInfo.maxMemoryBytes) * 100 : null;

    if (usagePercent !== null) {
        if (usagePercent > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_WEB_CRITICAL) {
            return 'error';
        }
        if (usagePercent > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_WEB_WARNING) {
            return 'warning';
        }
    }
    return 'info';
}
