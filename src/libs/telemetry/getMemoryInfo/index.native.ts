import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Log from '@libs/Log';
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

        const memoryInfo: MemoryInfo = {
            usedMemoryBytes,
            usedMemoryMB: usedMemoryBytes !== null ? Math.round(usedMemoryBytes / BYTES_PER_MB) : null,
            totalMemoryBytes,
            maxMemoryBytes,
            usagePercentage: usedMemoryBytes !== null && totalMemoryBytes !== null && totalMemoryBytes > 0 ? parseFloat(((usedMemoryBytes / totalMemoryBytes) * 100).toFixed(2)) : null,
            freeMemoryBytes: totalMemoryBytes !== null && usedMemoryBytes !== null ? totalMemoryBytes - usedMemoryBytes : null,
            freeMemoryMB: totalMemoryBytes !== null && usedMemoryBytes !== null ? Math.round((totalMemoryBytes - usedMemoryBytes) / BYTES_PER_MB) : null,
            freeMemoryPercentage: totalMemoryBytes !== null && usedMemoryBytes !== null ? parseFloat(((totalMemoryBytes - usedMemoryBytes) / totalMemoryBytes * 100).toFixed(2)) : null,
            platform: Platform.OS,
        };


        Log.info(`[getMemoryInfo] Memory check: ${memoryInfo.usedMemoryMB ?? '?'}MB used / ${memoryInfo.freeMemoryMB ?? '?'}MB free`, true, {
            ...memoryInfo,
        });

        return memoryInfo;
    } catch (error) {
        Log.hmmm('[getMemoryInfo] Failed to get memory info', {error});
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
