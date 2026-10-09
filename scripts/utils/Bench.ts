type BenchMark = {
    name: string;
    ms: number;
};

/**
 * Lightweight wall-clock instrumentation. Marks are recorded in insertion
 * order so a printed summary matches the run.
 */
class Bench {
    private readonly starts = new Map<string, number>();

    private readonly marks: BenchMark[] = [];

    start(name: string): void {
        this.starts.set(name, performance.now());
    }

    end(name: string): number {
        const startedAt = this.starts.get(name);
        if (startedAt === undefined) {
            throw new Error(`Bench.end(${name}) called without a matching start`);
        }
        this.starts.delete(name);
        const ms = performance.now() - startedAt;
        this.marks.push({name, ms});
        return ms;
    }

    async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
        this.start(name);
        try {
            return await fn();
        } finally {
            this.end(name);
        }
    }

    measureSync<T>(name: string, fn: () => T): T {
        this.start(name);
        try {
            return fn();
        } finally {
            this.end(name);
        }
    }

    getMarks(): readonly BenchMark[] {
        return this.marks;
    }

    format(label = 'timings'): string {
        if (this.marks.length === 0) {
            return `${label}: (none)`;
        }
        const total = this.marks.reduce((sum, mark) => sum + mark.ms, 0);
        const lines = this.marks.map((mark) => {
            const percent = total === 0 ? 0 : (mark.ms / total) * 100;
            return `  ${mark.name.padEnd(28)} ${mark.ms.toFixed(1).padStart(10)} ms  ${percent.toFixed(1).padStart(5)}%`;
        });
        return [`${label} (wall):`, ...lines, `  ${'total'.padEnd(28)} ${total.toFixed(1).padStart(10)} ms`].join('\n');
    }
}

export default Bench;
export type {BenchMark};
