type LineRun = {
    /** Index of the run's first point */
    start: number;

    /** Index of the run's last point, inclusive */
    end: number;

    /** Whether the run is drawn dashed because it touches a period that hasn't ended */
    isDashed: boolean;
};

/**
 * Splits a line into runs of consecutive segments drawn the same way. A segment is dashed when either of its points is
 * a period that hasn't ended, so the result is the same whichever order the points are sorted in.
 * A lone point has no segment, so it forms a single solid run and keeps the regular line's dot.
 */
function getLineRuns(openPointFlags: boolean[]): LineRun[] {
    if (openPointFlags.length < 2) {
        return openPointFlags.length ? [{start: 0, end: 0, isDashed: false}] : [];
    }

    const runs: LineRun[] = [];
    for (let index = 1; index < openPointFlags.length; index++) {
        const isDashed = !!openPointFlags.at(index - 1) || !!openPointFlags.at(index);
        const lastRun = runs.at(-1);
        if (lastRun?.isDashed === isDashed) {
            lastRun.end = index;
        } else {
            runs.push({start: index - 1, end: index, isDashed});
        }
    }
    return runs;
}

export default getLineRuns;
export type {LineRun};
