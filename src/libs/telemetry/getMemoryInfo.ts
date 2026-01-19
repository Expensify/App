import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Log from '@libs/Log';

const BYTES_PER_MB = 1024 * 1024;

type MemoryInfo = {
    usedMemoryBytes: number | null;
    totalMemoryBytes: number | null;
    maxMemoryBytes: number | null;
    usagePercentage: number | null;
    platform: string;
};

/**
 * Gets memory usage information for telemetry
 * Used by both Sentry tracking and troubleshooting tools
 * Returns raw byte values - use formatBytes() from NumberUtils for display formatting
 */
const getMemoryInfo = async (): Promise<MemoryInfo> => {
    try {
        // getTotalMemory has a sync version - use it for performance
        const totalMemoryBytes = DeviceInfo.getTotalMemorySync?.() ?? null;

        const [usedMemory, maxMemory] = await Promise.allSettled([DeviceInfo.getUsedMemory(), Platform.OS === 'android' ? DeviceInfo.getMaxMemory() : Promise.resolve(null)]);

        const usedMemoryBytes = usedMemory.status === 'fulfilled' ? usedMemory.value : null;
        const maxMemoryBytes = maxMemory.status === 'fulfilled' ? maxMemory.value : null;

        const memoryInfo = {
            usedMemoryBytes,
            totalMemoryBytes,
            maxMemoryBytes,
            usagePercentage: usedMemoryBytes !== null && totalMemoryBytes !== null && totalMemoryBytes > 0 
            ? parseFloat(((usedMemoryBytes / totalMemoryBytes) * 100).toFixed(2))
            : null,
            platform: Platform.OS,
        };

        const totalOrMax = memoryInfo.maxMemoryBytes ?? memoryInfo.totalMemoryBytes;
        const freeMemoryMB = totalOrMax && memoryInfo.usedMemoryBytes ? Math.round((totalOrMax - memoryInfo.usedMemoryBytes) / BYTES_PER_MB) : null;
        const usedMemoryMB = memoryInfo.usedMemoryBytes ? Math.round(memoryInfo.usedMemoryBytes / BYTES_PER_MB) : null;

        Log.info(
            `[getMemoryInfo] Memory check: ${usedMemoryMB ?? '?'}MB used / ${freeMemoryMB ?? '?'}MB free`,
            true,
            {
                ...memoryInfo,
                freeMemoryMB,
                usedMemoryMB,
            },
        );

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
