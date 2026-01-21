type MemoryInfo = {
  usedMemoryBytes: number | null;
  totalMemoryBytes: number | null;
  maxMemoryBytes: number | null;
  usagePercentage: number | null;
  platform: string;
};

// eslint-disable-next-line import/prefer-default-export
export type {MemoryInfo};