/**
 * @jest-environment jsdom
 */
import {renderHook} from '@testing-library/react-native';
import useOverlayEntry from '@components/Overlay/hooks/useOverlayEntry';
import {removeOverlayEntry, upsertOverlayEntry} from '@components/Overlay/libs/overlayStore';
import type {OverlayEntry} from '@components/Overlay/libs/overlayStore';
import CONST from '@src/CONST';

jest.mock('@components/Overlay/libs/overlayStore', () => ({
    __esModule: true,
    removeOverlayEntry: jest.fn(),
    upsertOverlayEntry: jest.fn(),
}));

const mockRemove = jest.mocked(removeOverlayEntry);
const mockUpsert = jest.mocked(upsertOverlayEntry);

const noop = () => {};

function makeEntry(id: string): OverlayEntry {
    return {
        kind: CONST.MODAL.MODAL_TYPE.POPOVER,
        id,
        close: noop,
        escapeBehavior: 'dismiss',
        anchor: null,
    };
}

beforeEach(() => {
    mockRemove.mockClear();
    mockUpsert.mockClear();
});

describe('useOverlayEntry', () => {
    it('upserts when an entry is provided', () => {
        const entry = makeEntry('a');
        renderHook(({current}: {current: OverlayEntry | null}) => useOverlayEntry(current), {initialProps: {current: entry}});
        expect(mockUpsert).toHaveBeenCalledWith(entry);
        expect(mockRemove).not.toHaveBeenCalled();
    });

    it('removes the old id before publishing the new one when entry.id rotates', () => {
        const entryA = makeEntry('a');
        const entryB = makeEntry('b');
        const {rerender} = renderHook(({current}: {current: OverlayEntry | null}) => useOverlayEntry(current), {initialProps: {current: entryA}});
        mockUpsert.mockClear();

        rerender({current: entryB});

        expect(mockRemove).toHaveBeenCalledWith('a');
        expect(mockUpsert).toHaveBeenLastCalledWith(entryB);
    });

    it('does not call remove when only the entry shape changes (same id)', () => {
        const entryA = makeEntry('a');
        const entryAUpdated = {...makeEntry('a'), close: () => {}};
        const {rerender} = renderHook(({current}: {current: OverlayEntry | null}) => useOverlayEntry(current), {initialProps: {current: entryA}});
        mockRemove.mockClear();

        rerender({current: entryAUpdated});

        expect(mockRemove).not.toHaveBeenCalled();
        expect(mockUpsert).toHaveBeenLastCalledWith(entryAUpdated);
    });

    it('removes the published id on unmount', () => {
        const entry = makeEntry('a');
        const {unmount} = renderHook(({current}: {current: OverlayEntry | null}) => useOverlayEntry(current), {initialProps: {current: entry}});

        unmount();

        expect(mockRemove).toHaveBeenCalledWith('a');
    });

    it('removes the published id when the entry transitions to null', () => {
        const initialProps: {current: OverlayEntry | null} = {current: makeEntry('a')};
        const {rerender} = renderHook(({current}: {current: OverlayEntry | null}) => useOverlayEntry(current), {initialProps});

        rerender({current: null});

        expect(mockRemove).toHaveBeenCalledWith('a');
    });
});
