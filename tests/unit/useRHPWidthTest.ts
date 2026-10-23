import {renderHook} from '@testing-library/react-native';

import type {RHPWidth, RHPWidthHint} from '@components/WideRHPContextProvider/types';

const mockSetRHPWidth = jest.fn<void, [{key: string}, RHPWidth]>();
const mockRemoveRHPRouteKey = jest.fn();
// One-shot: the store hands the width to the first screen that asks.
const mockConsumePendingRHPWidth = jest.fn<RHPWidthHint | undefined, [string]>();

jest.mock('@components/WideRHPContextProvider', () => ({
    __esModule: true,
    useWideRHPActions: () => ({
        setRHPWidth: mockSetRHPWidth,
        removeRHPRouteKey: mockRemoveRHPRouteKey,
    }),
    expandedRHPProgress: {setValue: jest.fn()},
}));

jest.mock('@components/WideRHPContextProvider/pendingRHPWidths', () => ({
    __esModule: true,
    consumePendingRHPWidth: (reportID: string) => mockConsumePendingRHPWidth(reportID),
}));

let mockRoute: {key: string; name: string; params: {reportID: string}} = {key: 'route-1', name: 'Screen', params: {reportID: 'report1'}};
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: () => mockRoute,
}));

// Required by path: jest would resolve index.native.ts, which has no wide RHP.
const {default: useRHPWidth} = require<{default: (width: RHPWidth) => void}>('../../src/components/WideRHPContextProvider/useRHPWidth/index.ts');

function renderHarness(width: RHPWidth) {
    const utils = renderHook<void, {width: RHPWidth}>((props) => useRHPWidth(props.width), {initialProps: {width}});
    return {...utils, setWidth: (next: RHPWidth) => utils.rerender({width: next})};
}

const lastRegisteredWidth = () => mockSetRHPWidth.mock.calls.at(-1)?.[1];

describe('useRHPWidth', () => {
    beforeEach(() => {
        mockSetRHPWidth.mockClear();
        mockConsumePendingRHPWidth.mockReset();
        mockRoute = {key: 'route-1', name: 'Screen', params: {reportID: 'report1'}};
    });

    it('opens at the width the press left for it, taking it so no later mount can act on the same one', () => {
        // Given a press that left a width for the report this screen is opening
        mockConsumePendingRHPWidth.mockReturnValueOnce('super-wide');

        // When the screen registers its own, narrower width
        renderHarness('wide');

        // Then it opens at the width left for it, and took it exactly once
        expect(lastRegisteredWidth()).toBe('super-wide');
        expect(mockConsumePendingRHPWidth).toHaveBeenCalledTimes(1);
        expect(mockConsumePendingRHPWidth).toHaveBeenCalledWith('report1');
    });

    it('does not take a width again while it keeps showing the same report, so a press for a report already open is left alone', () => {
        // Given a screen that has already opened, with nothing left for it
        const {setWidth} = renderHarness('wide');
        expect(lastRegisteredWidth()).toBe('wide');
        expect(mockConsumePendingRHPWidth).toHaveBeenCalledTimes(1);

        // When it re-renders, as it does whenever a press elsewhere leaves a width
        setWidth('wide');
        setWidth('super-wide');
        setWidth('wide');

        // Then it never asks again, so a width left for its report survives for the screen that press opens
        expect(mockConsumePendingRHPWidth).toHaveBeenCalledTimes(1);
    });

    it('keeps the width it took as its own floor, so the store forgetting it cannot narrow the open screen', () => {
        // Given a screen that opened super-wide on the width a press left for it
        mockConsumePendingRHPWidth.mockReturnValueOnce('super-wide');
        const {setWidth} = renderHarness('wide');
        expect(lastRegisteredWidth()).toBe('super-wide');

        // When it re-renders at its own narrower width, with the store no longer holding the width it took
        setWidth('wide');

        // Then it stays super-wide
        expect(lastRegisteredWidth()).toBe('super-wide');
    });

    it('registers its own width once it outgrows the floor a press left', () => {
        // Given a screen still narrow while it loads, held at the wide width a press left for it
        mockConsumePendingRHPWidth.mockReturnValueOnce('wide');
        const {setWidth} = renderHarness('narrow');
        expect(lastRegisteredWidth()).toBe('wide');

        // When its own data calls for super-wide, as a report with several expenses does
        setWidth('super-wide');

        // Then it widens past the floor, since the floor only ever holds a screen up
        expect(lastRegisteredWidth()).toBe('super-wide');
    });

    it('releases the floor once the caller reaches it, so a report that loses transactions can shrink', () => {
        // Given a screen that opened super-wide on the width a press left for it
        mockConsumePendingRHPWidth.mockReturnValueOnce('super-wide');
        const {setWidth} = renderHarness('wide');
        expect(lastRegisteredWidth()).toBe('super-wide');

        // When the screen's own data catches up to the floor, which releases it
        setWidth('super-wide');

        // Then it stays super-wide
        expect(lastRegisteredWidth()).toBe('super-wide');

        // When transactions are deleted until one remains, so the screen asks for the narrower width
        setWidth('wide');

        // Then it gets it, since no floor holds it up any more
        expect(lastRegisteredWidth()).toBe('wide');
    });

    it('takes the incoming report width when the carousel swaps params on the same screen', () => {
        // Given a screen that opened super-wide on the width a press left for it
        mockConsumePendingRHPWidth.mockReturnValueOnce('super-wide');
        const {setWidth} = renderHarness('wide');
        expect(lastRegisteredWidth()).toBe('super-wide');

        // When the transaction carousel switches report with setParams, which reuses the screen
        mockRoute = {key: 'route-1', name: 'Screen', params: {reportID: 'report2'}};
        mockConsumePendingRHPWidth.mockReturnValueOnce('wide');
        setWidth('wide');

        // Then it takes the width left for the incoming report instead of keeping the old report's floor
        expect(lastRegisteredWidth()).toBe('wide');
        expect(mockConsumePendingRHPWidth).toHaveBeenLastCalledWith('report2');
    });
});
