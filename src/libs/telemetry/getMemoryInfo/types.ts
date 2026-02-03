type MemoryInfo = {
    usedMemoryBytes: number | null;
    usedMemoryMB: number | null;
    totalMemoryBytes: number | null;
    maxMemoryBytes: number | null;
    usagePercentage: number | null;
    freeMemoryBytes: number | null;
    freeMemoryMB: number | null;
    freeMemoryPercentage: number | null;
    platform: string;
};

// eslint-disable-next-line import/prefer-default-export
export type {MemoryInfo};
