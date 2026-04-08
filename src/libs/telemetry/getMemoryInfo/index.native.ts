import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import type {MemoryInfo} from './types';

const BYTES_PER_MB = 1024 * 1024;

const normalizeMemoryValue = (value: number | null | undefined): number | null => {
    if (value === null || value === undefined || value < 0) {
        return null;
    }
    return value;
};

const getMemoryInfo = async (): Promise<MemoryInfo> => {
    try {
        const totalMemoryBytesRaw = DeviceInfo.getTotalMemorySync?.() ?? null;
        const totalMemoryBytes = normalizeMemoryValue(totalMemoryBytesRaw);

        const [usedMemory, maxMemory] = await Promise.allSettled([DeviceInfo.getUsedMemory(), Platform.OS === 'android' ? DeviceInfo.getMaxMemory() : Promise.resolve(null)]);

        const usedMemoryBytesRaw = usedMemory.status === 'fulfilled' ? usedMemory.value : null;
        const usedMemoryBytes = normalizeMemoryValue(usedMemoryBytesRaw);

        const maxMemoryBytesRaw = maxMemory.status === 'fulfilled' ? maxMemory.value : null;
        const maxMemoryBytes = normalizeMemoryValue(maxMemoryBytesRaw);

        // Calculate usage percentage based on appropriate metric per platform
        // Android: Use % of device RAM (RSS / totalMemory) - temporary until native onTrimMemory module
        //          This is more adaptive than absolute MB and scales with device capabilities
        // iOS: No calculation (use absolute MB thresholds)
        let usagePercentage: number | null = null;
        if (Platform.OS === 'android' && usedMemoryBytes !== null && totalMemoryBytes !== null && totalMemoryBytes > 0) {
            usagePercentage = parseFloat(((usedMemoryBytes / totalMemoryBytes) * 100).toFixed(2));
        }

        const freeMemoryBytes = totalMemoryBytes !== null && usedMemoryBytes !== null ? totalMemoryBytes - usedMemoryBytes : null;
        const freeMemoryMB = freeMemoryBytes !== null ? Math.round(freeMemoryBytes / BYTES_PER_MB) : null;
        const freeMemoryPercentage =
            totalMemoryBytes !== null && usedMemoryBytes !== null && totalMemoryBytes > 0 ? parseFloat((((totalMemoryBytes - usedMemoryBytes) / totalMemoryBytes) * 100).toFixed(2)) : null;

        return {
            usedMemoryBytes,
            usedMemoryMB: usedMemoryBytes !== null ? Math.round(usedMemoryBytes / BYTES_PER_MB) : null,
            totalMemoryBytes,
            maxMemoryBytes,
            usagePercentage,
            freeMemoryBytes,
            freeMemoryMB,
            freeMemoryPercentage,
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
