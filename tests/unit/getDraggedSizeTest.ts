import getDraggedSize from '@components/ResizeHandle/getDraggedSize';

describe('getDraggedSize', () => {
    it('adds the travel to the start size, rounding to a whole px', () => {
        // Given a 200px column
        // When the drag grows it by 30.6px
        const size = getDraggedSize(200, 30.6, {min: 48});

        // Then the column grows by the travel, rounded so the layout stays on whole px
        expect(size).toBe(231);
    });

    it('stops at the bounds however far the pointer travels', () => {
        // Given a 440px pane bounded to 220-880px
        const bounds = {min: 220, max: 880};

        // When the pointer travels far past either bound
        const widest = getDraggedSize(440, 1500, bounds);
        const narrowest = getDraggedSize(440, -1500, bounds);

        // Then the size stops at the bound it ran into, so the edge can't leave its range
        expect(widest).toBe(880);
        expect(narrowest).toBe(220);
    });

    it('keeps the minimum when a small window pushes the maximum below it', () => {
        // Given a window so narrow that the maximum falls under the minimum
        // When the pane is dragged wider
        const size = getDraggedSize(220, 100, {min: 220, max: 150});

        // Then it stays at the minimum, so the pane never becomes unusably narrow
        expect(size).toBe(220);
    });

    it('has no maximum unless one is given', () => {
        // Given a column with only a minimum
        // When it is dragged 5000px wider
        const size = getDraggedSize(200, 5000, {min: 48});

        // Then nothing caps it, matching table columns, which grow into horizontal scroll
        expect(size).toBe(5200);
    });

    it('catches on the snap size within the threshold, and lets go past it', () => {
        // Given a 400px pane that snaps onto 440px within 20px
        const bounds = {min: 380, max: 880, snap: {to: 440, threshold: 20}};

        // When it is dragged to just under, just over, and past the threshold
        const atLowerEdge = getDraggedSize(400, 20, bounds);
        const atUpperEdge = getDraggedSize(400, 60, bounds);
        const past = getDraggedSize(400, 61, bounds);

        // Then it holds on the snap size until the pointer leaves the threshold, so the default is easy to land on but never traps the edge
        expect(atLowerEdge).toBe(440);
        expect(atUpperEdge).toBe(440);
        expect(past).toBe(461);
    });

    it('keeps the bounds when the snap size falls outside them', () => {
        // Given a window so narrow that the maximum falls under the snap size
        const bounds = {min: 380, max: 430, snap: {to: 440, threshold: 20}};

        // When the pane is dragged within the threshold of the snap size, short of and past the maximum
        const shortOfMax = getDraggedSize(400, 25, bounds);
        const pastMax = getDraggedSize(400, 35, bounds);

        // Then it follows the pointer up to the maximum, so an unreachable snap size never makes the edge jump
        expect(shortOfMax).toBe(425);
        expect(pastMax).toBe(430);
    });
});
