import {act, renderHook} from '@testing-library/react-native';

import type {RHPWidth, RHPWidthHint} from '@components/WideRHPContextProvider/types';

const mockSetRHPWidth = jest.fn<void, [{key: string}, RHPWidth]>();
const mockRemoveRHPRouteKey = jest.fn();
const mockUnmarkReportRHPWidth = jest.fn();
// Re-assignable, because the provider hands out a new getter whenever the hint map changes and that is what re-runs the effect.
let mockGetReportRHPWidthHint = jest.fn<RHPWidthHint | undefined, [string]>();

jest.mock('@components/WideRHPContextProvider', () => ({
    __esModule: true,
    useWideRHPActions: () => ({
        setRHPWidth: mockSetRHPWidth,
        removeRHPRouteKey: mockRemoveRHPRouteKey,
        getReportRHPWidthHint: mockGetReportRHPWidthHint,
        unmarkReportRHPWidth: mockUnmarkReportRHPWidth,
    }),
    expandedRHPProgress: {setValue: jest.fn()},
}));

let mockRoute: {key: string; name: string; params: {reportID: string}} = {key: 'route-1', name: 'Screen', params: {reportID: 'report1'}};
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: () => mockRoute,
}));

// Required by path: jest resolves the platform variant first, and index.native.ts is the no-op the wide RHP does not exist for.
const {default: useRHPWidth} = require<{default: (width: RHPWidth) => void}>('../../src/components/WideRHPContextProvider/useRHPWidth/index.ts');

function renderHarness(width: RHPWidth) {
    const utils = renderHook<void, {width: RHPWidth}>((props) => useRHPWidth(props.width), {initialProps: {width}});
    return {...utils, setWidth: (next: RHPWidth) => utils.rerender({width: next})};
}

const lastRegisteredWidth = () => mockSetRHPWidth.mock.calls.at(-1)?.[1];

describe('useRHPWidth', () => {
    beforeEach(() => {
        mockSetRHPWidth.mockClear();
        mockUnmarkReportRHPWidth.mockClear();
        mockGetReportRHPWidthHint = jest.fn<RHPWidthHint | undefined, [string]>();
        mockRoute = {key: 'route-1', name: 'Screen', params: {reportID: 'report1'}};
    });

    it('opens at the hinted width and clears the hint, so the next navigation is free to be marked differently', () => {
        mockGetReportRHPWidthHint.mockReturnValue('super-wide');
        renderHarness('wide');

        expect(lastRegisteredWidth()).toBe('super-wide');
        expect(mockUnmarkReportRHPWidth).toHaveBeenCalledWith('report1', 'super-wide');
    });

    it('keeps the consumed hint as its own floor, so clearing it cannot narrow the open screen', () => {
        mockGetReportRHPWidthHint.mockReturnValue('super-wide');
        const {setWidth} = renderHarness('wide');
        expect(lastRegisteredWidth()).toBe('super-wide');

        mockGetReportRHPWidthHint.mockReturnValue(undefined);
        setWidth('wide');

        expect(lastRegisteredWidth()).toBe('super-wide');
    });

    it('registers the screen own width once it outgrows the floor', () => {
        mockGetReportRHPWidthHint.mockReturnValue('wide');
        const {setWidth} = renderHarness('wide');
        mockGetReportRHPWidthHint.mockReturnValue(undefined);

        setWidth('super-wide');

        expect(lastRegisteredWidth()).toBe('super-wide');
    });

    it('releases the floor once the caller reaches it, so a report that loses transactions can shrink', () => {
        mockGetReportRHPWidthHint.mockReturnValue('super-wide');
        const {setWidth} = renderHarness('wide');
        expect(lastRegisteredWidth()).toBe('super-wide');
        mockGetReportRHPWidthHint.mockReturnValue(undefined);

        // The screen's own data catches up to the hint, which is the last moment the hint has anything to say.
        setWidth('super-wide');
        expect(lastRegisteredWidth()).toBe('super-wide');

        // Transactions are deleted until one remains, so the screen asks for the narrower width and gets it.
        setWidth('wide');
        expect(lastRegisteredWidth()).toBe('wide');
    });

    it('clears the hint on unmount, bounding one left behind by a navigation that mounted no screen', async () => {
        mockGetReportRHPWidthHint.mockReturnValue(undefined);
        const {unmount} = renderHarness('wide');
        mockUnmarkReportRHPWidth.mockClear();

        await act(async () => {
            unmount();
        });

        expect(mockUnmarkReportRHPWidth).toHaveBeenCalledWith('report1');
    });

    it('consumes the incoming report hint when the carousel swaps params on the same screen', () => {
        mockGetReportRHPWidthHint.mockReturnValue('super-wide');
        const {setWidth} = renderHarness('wide');
        expect(lastRegisteredWidth()).toBe('super-wide');

        // The transaction carousel navigates with setParams, so the screen is reused and only its reportID changes.
        mockRoute = {key: 'route-1', name: 'Screen', params: {reportID: 'report2'}};
        mockGetReportRHPWidthHint.mockImplementation((reportID: string) => (reportID === 'report2' ? 'wide' : undefined));
        setWidth('wide');

        expect(lastRegisteredWidth()).toBe('wide');
        expect(mockUnmarkReportRHPWidth).toHaveBeenLastCalledWith('report2', 'wide');
    });

    it('clears a hint marked for the report it is already showing, which no navigation will ever consume', () => {
        mockGetReportRHPWidthHint.mockReturnValue(undefined);
        const {setWidth} = renderHarness('wide');
        expect(lastRegisteredWidth()).toBe('wide');

        // Clicking a Search row for the report already on screen marks a hint, which hands the effect a new getter.
        mockGetReportRHPWidthHint = jest.fn<RHPWidthHint | undefined, [string]>().mockReturnValue('super-wide');
        setWidth('wide');

        expect(lastRegisteredWidth()).toBe('wide');
        expect(mockUnmarkReportRHPWidth).toHaveBeenLastCalledWith('report1', 'super-wide');
    });

    it('leaves the hint map alone when the effect re-runs and no hint stands for the report it shows', () => {
        mockGetReportRHPWidthHint.mockReturnValue(undefined);
        const {setWidth} = renderHarness('wide');
        mockUnmarkReportRHPWidth.mockClear();

        // Marking another report hands every mounted screen a new getter, which says nothing about this one.
        mockGetReportRHPWidthHint = jest.fn<RHPWidthHint | undefined, [string]>().mockImplementation((reportID: string) => (reportID === 'report2' ? 'wide' : undefined));
        setWidth('wide');

        expect(mockUnmarkReportRHPWidth).not.toHaveBeenCalled();
    });
});
