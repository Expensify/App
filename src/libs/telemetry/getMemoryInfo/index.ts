import {Platform} from 'react-native';
import Log from '@libs/Log';
import type {MemoryInfo} from './types';

const BYTES_PER_MB = 1024 * 1024;
const BYTES_PER_GB = BYTES_PER_MB * 1024;

// Only works in Chrome/Edge (Chromium browsers) - navigator.deviceMemory and performance.memory are not available in Firefox/Safari
const getMemoryInfo = async (): Promise<MemoryInfo> => {
    try {
        let totalMemoryBytes: number | null = null;
        let usedMemoryBytes: number | null = null;
        let maxMemoryBytes: number | null = null;

        if (typeof window === 'undefined') {
            return {
                usedMemoryBytes: null,
                totalMemoryBytes: null,
                maxMemoryBytes: null,
                usagePercentage: null,
                platform: Platform.OS,
            };
        }

        if (window.navigator) {
            try {
                const deviceMemoryGB = (window.navigator as Navigator & {deviceMemory?: number}).deviceMemory;
                if (deviceMemoryGB && deviceMemoryGB > 0) {
                    totalMemoryBytes = deviceMemoryGB * BYTES_PER_GB;
                }
            } catch (error) {
                Log.hmmm('[getMemoryInfo] Error accessing deviceMemory', {error});
            }
        }

        // performance.memory is deprecated but still works in Chromium, not enumerable so we use direct access
        if (window.performance) {
            try {
                const perfMemory = (
                    window.performance as Performance & {
                        memory?: {
                            usedJSHeapSize?: number;
                            totalJSHeapSize?: number;
                            jsHeapSizeLimit?: number;
                        };
                    }
                ).memory;

                if (perfMemory) {
                    if (perfMemory.usedJSHeapSize && perfMemory.usedJSHeapSize > 0) {
                        usedMemoryBytes = perfMemory.usedJSHeapSize;
                    }

                    if (perfMemory.jsHeapSizeLimit && perfMemory.jsHeapSizeLimit > 0) {
                        maxMemoryBytes = perfMemory.jsHeapSizeLimit;
                    }

                    if (!totalMemoryBytes && perfMemory.totalJSHeapSize && perfMemory.totalJSHeapSize > 0) {
                        totalMemoryBytes = perfMemory.totalJSHeapSize;
                    }
                }
            } catch (error) {
                // Gracefully degrade - these APIs are not available in Firefox/Safari
            }
        }

        const memoryInfo: MemoryInfo = {
            usedMemoryBytes,
            totalMemoryBytes,
            maxMemoryBytes,
            usagePercentage: usedMemoryBytes !== null && totalMemoryBytes !== null && totalMemoryBytes > 0 ? parseFloat(((usedMemoryBytes / totalMemoryBytes) * 100).toFixed(2)) : null,
            platform: Platform.OS,
        };

        const totalOrMax = memoryInfo.maxMemoryBytes ?? memoryInfo.totalMemoryBytes;
        const freeMemoryMB = totalOrMax && memoryInfo.usedMemoryBytes ? Math.round((totalOrMax - memoryInfo.usedMemoryBytes) / BYTES_PER_MB) : null;
        const usedMemoryMB = memoryInfo.usedMemoryBytes ? Math.round(memoryInfo.usedMemoryBytes / BYTES_PER_MB) : null;

        Log.info(`[getMemoryInfo] Memory check: ${usedMemoryMB ?? '?'}MB used / ${freeMemoryMB ?? '?'}MB free`, true, {
            ...memoryInfo,
            freeMemoryMB,
            usedMemoryMB,
        });

        return memoryInfo;
    } catch (error) {
        Log.hmmm('[getMemoryInfo] Failed to get memory info', {error});
        return {
            usedMemoryBytes: null,
            totalMemoryBytes: null,
            maxMemoryBytes: null,
            usagePercentage: null,
            platform: Platform.OS,
        };
    }
};

export default getMemoryInfo;
