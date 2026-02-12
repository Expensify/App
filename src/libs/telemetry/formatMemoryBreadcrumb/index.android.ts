import type {MemoryInfo} from '@libs/telemetry/getMemoryInfo/types';

/**
 * Format breadcrumb message for Android platform
 * @param memoryInfo - Memory information object
 * @param usedMemoryMB - Used memory in MB (from memoryInfo.usedMemoryMB)
 * @returns Formatted breadcrumb message
 */
export default function formatMemoryBreadcrumb(memoryInfo: MemoryInfo, usedMemoryMB: number | null): string {
    const usagePercent = memoryInfo.usagePercentage?.toFixed(0) ?? '?';
    return `RAM Check: ${usedMemoryMB ?? '?'}MB used (${usagePercent}% device RAM)`;
}
