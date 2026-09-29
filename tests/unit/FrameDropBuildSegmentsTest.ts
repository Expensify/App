import buildSegments from '@libs/telemetry/frameDrops/buildSegments';

import CONST from '@src/CONST';

const NONE = CONST.TELEMETRY.FRAME_DROPS.NONE;

describe('buildSegments', () => {
    it('returns one segment for a window without context changes', () => {
        // Given a screen that was opened before the window and nothing else going on
        const screens = [{time: 0, screen: 'Home'}];

        // When the window is split into segments
        const segments = buildSegments(100, 200, screens, [], []);

        // Then the whole window belongs to that screen, so a single native query covers it
        expect(segments).toEqual([{start: 100, end: 200, screen: 'Home', interaction: NONE, operation: NONE}]);
    });

    it('splits the window at a screen change', () => {
        // Given a navigation in the middle of the window
        const screens = [
            {time: 0, screen: 'Home'},
            {time: 150, screen: 'Report'},
        ];

        // When the window is split into segments
        const segments = buildSegments(100, 200, screens, [], []);

        // Then frames before and after the navigation belong to different screens
        expect(segments).toEqual([
            {start: 100, end: 150, screen: 'Home', interaction: NONE, operation: NONE},
            {start: 150, end: 200, screen: 'Report', interaction: NONE, operation: NONE},
        ]);
    });

    it('attributes the press window to the press and merges the time around it', () => {
        // Given a press whose window ends inside the analyzed window
        const screens = [{time: 0, screen: 'Home'}];
        const interactions = [{id: 1, label: 'FAB', start: 120, end: 160}];

        // When the window is split into segments
        const segments = buildSegments(100, 200, screens, interactions, []);

        // Then only the press window carries the press label
        expect(segments).toEqual([
            {start: 100, end: 120, screen: 'Home', interaction: NONE, operation: NONE},
            {start: 120, end: 160, screen: 'Home', interaction: 'FAB', operation: NONE, interactionID: 1},
            {start: 160, end: 200, screen: 'Home', interaction: NONE, operation: NONE},
        ]);
    });

    it('gives overlapping operations to the most recently started one', () => {
        // Given a long operation with a shorter one nested inside it
        const operations = [
            {id: 1, name: 'api.OpenApp', start: 100, end: 200},
            {id: 2, name: 'pusher', start: 130, end: 170},
        ];

        // When the window is split into segments
        const segments = buildSegments(100, 200, [], [], operations);

        // Then the nested operation owns its time, as it's the most specific thing going on, and the outer one owns the rest
        expect(segments.map(({start, end, operation}) => ({start, end, operation}))).toEqual([
            {start: 100, end: 130, operation: 'api.OpenApp'},
            {start: 130, end: 170, operation: 'pusher'},
            {start: 170, end: 200, operation: 'api.OpenApp'},
        ]);
    });

    it('keeps an interaction that has not ended yet until the end of the window', () => {
        // Given a scroll that is still going on
        const interactions = [{id: 1, label: 'scroll', start: 150}];

        // When the window is split into segments
        const segments = buildSegments(100, 200, [], interactions, []);

        // Then the scroll owns the rest of the window
        expect(segments.map(({start, end, interaction}) => ({start, end, interaction}))).toEqual([
            {start: 100, end: 150, interaction: NONE},
            {start: 150, end: 200, interaction: 'scroll'},
        ]);
    });

    it('returns nothing for an empty window', () => {
        // Given a window that ends where it starts
        // When the window is split into segments
        const segments = buildSegments(100, 100, [], [], []);

        // Then there is nothing to query
        expect(segments).toEqual([]);
    });
});
