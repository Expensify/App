import type * as Sentry from '@sentry/react-native';
import type {MemoryInfo} from '@libs/telemetry/getMemoryInfo/types';
import CONST from '@src/CONST';

/**
 * Determine memory log level for iOS platform based on absolute MB values
 * @param memoryInfo - Memory information object
 * @returns Sentry severity level based on memory usage
 */
export default function getMemoryLogLevel(memoryInfo: MemoryInfo): Sentry.SeverityLevel {
    if (memoryInfo.usedMemoryMB !== null) {
        if (memoryInfo.usedMemoryMB > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_IOS_CRITICAL_MB) {
            return 'error';
        }
        if (memoryInfo.usedMemoryMB > CONST.TELEMETRY.CONFIG.MEMORY_THRESHOLD_IOS_WARNING_MB) {
            return 'warning';
        }
    }
    return 'info';
}
