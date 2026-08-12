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

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export -- Single type export is intentional; more types may be added in the future
export type {MemoryInfo};
