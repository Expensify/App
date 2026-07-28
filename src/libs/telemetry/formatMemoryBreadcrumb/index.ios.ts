import type {MemoryInfo} from '@libs/telemetry/getMemoryInfo/types';

/**
 * Format breadcrumb message for iOS platform
 * @param memoryInfo - Memory information object
 * @param usedMemoryMB - Used memory in MB (from memoryInfo.usedMemoryMB)
 * @returns Formatted breadcrumb message
 */
export default function formatMemoryBreadcrumb(_memoryInfo: MemoryInfo, usedMemoryMB: number | null): string {
    return `RAM Check: ${usedMemoryMB ?? '?'}MB used (iOS - no limit API)`;
}
