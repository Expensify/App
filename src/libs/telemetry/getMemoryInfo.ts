import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Log from '@libs/Log';

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

        return {
            usedMemoryBytes,
            totalMemoryBytes,
            maxMemoryBytes,
            usagePercentage: usedMemoryBytes !== null && totalMemoryBytes !== null && totalMemoryBytes > 0 ? Math.round((usedMemoryBytes / totalMemoryBytes) * 100 * 100) / 100 : null,
            platform: Platform.OS,
        };
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
