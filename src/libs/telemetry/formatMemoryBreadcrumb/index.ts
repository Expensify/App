import type {MemoryInfo} from '@libs/telemetry/getMemoryInfo/types';

/**
 * Format breadcrumb message for web platform
 * @param memoryInfo - Memory information object
 * @param usedMemoryMB - Used memory in MB (from memoryInfo.usedMemoryMB)
 * @returns Formatted breadcrumb message
 */
export default function formatMemoryBreadcrumb(memoryInfo: MemoryInfo, usedMemoryMB: number | null): string {
    const maxMB = memoryInfo.maxMemoryBytes ? Math.round(memoryInfo.maxMemoryBytes / (1024 * 1024)) : '?';
    return `RAM Check: ${usedMemoryMB ?? '?'}MB / ${maxMB}MB limit`;
}
