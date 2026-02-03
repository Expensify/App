import {Platform} from 'react-native';
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
                usedMemoryMB: null,
                totalMemoryBytes: null,
                maxMemoryBytes: null,
                usagePercentage: null,
                freeMemoryBytes: null,
                freeMemoryMB: null,
                freeMemoryPercentage: null,
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
                // Gracefully degrade - deviceMemory requires HTTPS and is Chromium-only
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

        return {
            usedMemoryBytes,
            usedMemoryMB: usedMemoryBytes !== null ? Math.round(usedMemoryBytes / BYTES_PER_MB) : null,
            totalMemoryBytes,
            maxMemoryBytes,
            usagePercentage: usedMemoryBytes !== null && totalMemoryBytes !== null && totalMemoryBytes > 0 ? parseFloat(((usedMemoryBytes / totalMemoryBytes) * 100).toFixed(2)) : null,
            freeMemoryBytes: totalMemoryBytes !== null && usedMemoryBytes !== null ? totalMemoryBytes - usedMemoryBytes : null,
            freeMemoryMB: totalMemoryBytes !== null && usedMemoryBytes !== null ? Math.round((totalMemoryBytes - usedMemoryBytes) / BYTES_PER_MB) : null,
            freeMemoryPercentage: totalMemoryBytes !== null && usedMemoryBytes !== null ? parseFloat((((totalMemoryBytes - usedMemoryBytes) / totalMemoryBytes) * 100).toFixed(2)) : null,
            platform: Platform.OS,
        };
    } catch (error) {
        return {
            usedMemoryBytes: null,
            usedMemoryMB: null,
            totalMemoryBytes: null,
            maxMemoryBytes: null,
            usagePercentage: null,
            freeMemoryBytes: null,
            freeMemoryMB: null,
            freeMemoryPercentage: null,
            platform: Platform.OS,
        };
    }
};

export default getMemoryInfo;
