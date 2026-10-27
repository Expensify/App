import getLineRuns from '@components/Charts/utils/getLineRuns';

describe('getLineRuns', () => {
    it('dashes from the segment leading into the first open period when periods run oldest first', () => {
        // Given three finished months followed by the current month and a later month holding future-dated expenses
        const openPointFlags = [false, false, false, true, true];

        // When the line is split into runs
        const runs = getLineRuns(openPointFlags);

        // Then the finished months stay solid and the line is dashed from the last finished month onward
        expect(runs).toEqual([
            {start: 0, end: 2, isDashed: false},
            {start: 2, end: 4, isDashed: true},
        ]);
    });

    it('keeps finished periods solid when periods run newest first', () => {
        // Given a later month and the current month sorted before the finished months, as a descending sort orders them
        const openPointFlags = [true, true, false, false, false];

        // When the line is split into runs
        const runs = getLineRuns(openPointFlags);

        // Then only the segments touching the open months are dashed, so the finished history stays solid
        expect(runs).toEqual([
            {start: 0, end: 2, isDashed: true},
            {start: 2, end: 4, isDashed: false},
        ]);
    });

    it('dashes only around an open period between finished ones', () => {
        // Given an open period sorted between finished ones, as sorting by total can place it
        const openPointFlags = [false, false, true, false, false];

        // When the line is split into runs
        const runs = getLineRuns(openPointFlags);

        // Then the two segments touching the open period are dashed and the rest stays solid
        expect(runs).toEqual([
            {start: 0, end: 1, isDashed: false},
            {start: 1, end: 3, isDashed: true},
            {start: 3, end: 4, isDashed: false},
        ]);
    });

    it('keeps a lone point solid', () => {
        // Given a single period that hasn't ended
        const openPointFlags = [true];

        // When the line is split into runs
        const runs = getLineRuns(openPointFlags);

        // Then it forms one solid run, since there is no segment leading into it to dash
        expect(runs).toEqual([{start: 0, end: 0, isDashed: false}]);
    });

    it('returns no runs for an empty line', () => {
        // Given no points
        // When the line is split into runs
        const runs = getLineRuns([]);

        // Then there is nothing to draw
        expect(runs).toEqual([]);
    });
});
