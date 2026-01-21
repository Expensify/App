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
            totalMemoryBytes,
            maxMemoryBytes,
            usagePercentage:
              usedMemoryBytes !== null && totalMemoryBytes !== null && totalMemoryBytes > 0 
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
