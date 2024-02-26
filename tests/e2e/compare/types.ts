type Entries = number[];

/** Metadata information for performance results. */

/** Entry in the performance results file. */
type PerformanceEntry = {
    /** Number of times the measurement test was run. */
    runs: number;

    /** Arithmetic average of measured render/execution durations for each run. */
    mean: number;

    /** Standard deviation of measured render/execution durations for each run. */
    stdev: number;

    /** Array of measured render/execution durations for each run. */
    entries: Entries;
};

/**
 * Compare entry for tests that have both baseline and current entry
 */
type CompareEntry = {
    name: string;
    current: PerformanceEntry;
    baseline: PerformanceEntry;
    durationDiff: number;
    relativeDurationDiff: number;
};

/**
 * Compare entry for tests that have only current entry
 */
type AddedEntry = {
    name: string;
    current: PerformanceEntry;
};

/**
 * Compare entry for tests that have only baseline entry
 */
type RemovedEntry = {
    name: string;
    baseline: PerformanceEntry;
};

/** Output of compare function. */
type CompareResult = {
    significance: CompareEntry[];
    meaningless: CompareEntry[];
    added: AddedEntry[];
    removed: RemovedEntry[];
    errors?: string[];
    warnings?: string[];
};

export type {Entries, PerformanceEntry, CompareEntry, AddedEntry, RemovedEntry, CompareResult};
