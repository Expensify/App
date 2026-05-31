import {renderHook} from '@testing-library/react-native';
import useFrozenPreSelection from '@hooks/useFrozenPreSelection';
import CONST from '@src/CONST';

type Item = {
    keyForList: string;
    text?: string;
    isSelected?: boolean;
};

const longList = CONST.STANDARD_LIST_ITEM_LIMIT;
const shortList = CONST.STANDARD_LIST_ITEM_LIMIT - 1;
const getKey = (item: Item) => item.keyForList;

describe('useFrozenPreSelection', () => {
    it('does not capture until the list is ready', () => {
        const item: Item = {keyForList: '1'};
        const {result} = renderHook(() =>
            useFrozenPreSelection<Item>({
                sections: [{data: [item], sectionIndex: 1}],
                snapshotSource: [item],
                getKey,
                isReady: false,
                visibleCount: longList,
            }),
        );

        expect(result.current.frozenSections).toEqual([]);
        expect(result.current.listSections).toEqual([{data: [item], sectionIndex: 1}]);
        expect(result.current.isFrozen(item)).toBe(false);
    });

    it('pulls pre-selected items into a top section and strips them from the input sections', () => {
        const pinned: Item = {keyForList: '1', isSelected: true};
        const other: Item = {keyForList: '2'};
        const {result} = renderHook(() =>
            useFrozenPreSelection<Item>({
                sections: [{data: [pinned, other], sectionIndex: 1}],
                snapshotSource: [pinned],
                getKey,
                isReady: true,
                visibleCount: longList,
            }),
        );

        expect(result.current.frozenSections).toEqual([{data: [pinned], sectionIndex: 0}]);
        expect(result.current.listSections).toEqual([{data: [other], sectionIndex: 1}]);
        expect(result.current.isFrozen(pinned)).toBe(true);
        expect(result.current.isFrozen(other)).toBe(false);
    });

    it('skips pinning when the visible list is below the threshold', () => {
        const item: Item = {keyForList: '1'};
        const {result} = renderHook(() =>
            useFrozenPreSelection<Item>({
                sections: [{data: [item], sectionIndex: 1}],
                snapshotSource: [item],
                getKey,
                isReady: true,
                visibleCount: shortList,
            }),
        );

        expect(result.current.frozenSections).toEqual([]);
        expect(result.current.listSections).toEqual([{data: [item], sectionIndex: 1}]);
        expect(result.current.isFrozen(item)).toBe(false);
    });

    it('respects a custom threshold', () => {
        const item: Item = {keyForList: '1'};
        const {result} = renderHook(() =>
            useFrozenPreSelection<Item>({
                sections: [{data: [item], sectionIndex: 1}],
                snapshotSource: [item],
                getKey,
                isReady: true,
                visibleCount: 5,
                threshold: 5,
            }),
        );

        expect(result.current.frozenSections).toEqual([{data: [item], sectionIndex: 0}]);
    });

    it('honors canCapture for hydration timing', () => {
        const item: Item = {keyForList: '7'};
        const {result, rerender} = renderHook(
            ({snapshotSource, canCapture}: {snapshotSource: Item[]; canCapture: boolean}) =>
                useFrozenPreSelection<Item>({
                    sections: [{data: [item], sectionIndex: 1}],
                    snapshotSource,
                    getKey,
                    isReady: true,
                    visibleCount: longList,
                    canCapture,
                }),
            {initialProps: {snapshotSource: [] as Item[], canCapture: false}},
        );

        expect(result.current.frozenSections).toEqual([]);

        rerender({snapshotSource: [item], canCapture: true});

        expect(result.current.frozenSections).toEqual([{data: [item], sectionIndex: 0}]);
        expect(result.current.isFrozen(item)).toBe(true);
    });

    it('keeps the snapshot stable after the first capture even when snapshotSource changes', () => {
        const captured: Item = {keyForList: '1'};
        const newcomer: Item = {keyForList: '99'};
        const {result, rerender} = renderHook(
            ({snapshotSource, sections}: {snapshotSource: Item[]; sections: Array<{data: Item[]; sectionIndex: number}>}) =>
                useFrozenPreSelection<Item>({
                    sections,
                    snapshotSource,
                    getKey,
                    isReady: true,
                    visibleCount: longList,
                }),
            {initialProps: {snapshotSource: [captured], sections: [{data: [captured], sectionIndex: 1}]}},
        );

        expect(result.current.frozenSections).toEqual([{data: [captured], sectionIndex: 0}]);

        rerender({snapshotSource: [newcomer], sections: [{data: [captured, newcomer], sectionIndex: 1}]});

        expect(result.current.frozenSections).toEqual([{data: [captured], sectionIndex: 0}]);
        expect(result.current.listSections).toEqual([{data: [newcomer], sectionIndex: 1}]);
        expect(result.current.isFrozen(captured)).toBe(true);
        expect(result.current.isFrozen(newcomer)).toBe(false);
    });

    it('preserves snapshot order for the frozen section', () => {
        const a: Item = {keyForList: 'a'};
        const b: Item = {keyForList: 'b'};
        const c: Item = {keyForList: 'c'};
        const {result} = renderHook(() =>
            useFrozenPreSelection<Item>({
                // Items appear in a different order in the input sections than in the snapshot.
                sections: [{data: [c, a, b], sectionIndex: 1}],
                snapshotSource: [b, a, c],
                getKey,
                isReady: true,
                visibleCount: longList,
            }),
        );

        expect(result.current.frozenSections).toEqual([{data: [b, a, c], sectionIndex: 0}]);
    });

    it('drops frozen items that are not present in any input section', () => {
        const visible: Item = {keyForList: 'visible'};
        const missing: Item = {keyForList: 'missing'};
        const {result} = renderHook(() =>
            useFrozenPreSelection<Item>({
                sections: [{data: [visible], sectionIndex: 1}],
                snapshotSource: [missing, visible],
                getKey,
                isReady: true,
                visibleCount: longList,
            }),
        );

        // `missing` was captured (isFrozen returns true) but is not rendered.
        expect(result.current.frozenSections).toEqual([{data: [visible], sectionIndex: 0}]);
        expect(result.current.isFrozen(missing)).toBe(true);
        expect(result.current.isFrozen(visible)).toBe(true);
    });

    it('uses the live row from input sections so toggles refresh in place', () => {
        const captureTime: Item = {keyForList: '1', text: 'before', isSelected: true};
        const liveAfterToggle: Item = {keyForList: '1', text: 'after', isSelected: false};

        const {result, rerender} = renderHook(
            ({sections}: {sections: Array<{data: Item[]; sectionIndex: number}>}) =>
                useFrozenPreSelection<Item>({
                    sections,
                    snapshotSource: [captureTime],
                    getKey,
                    isReady: true,
                    visibleCount: longList,
                }),
            {initialProps: {sections: [{data: [captureTime], sectionIndex: 1}]}},
        );

        expect(result.current.frozenSections).toEqual([{data: [captureTime], sectionIndex: 0}]);

        rerender({sections: [{data: [liveAfterToggle], sectionIndex: 1}]});

        expect(result.current.frozenSections).toEqual([{data: [liveAfterToggle], sectionIndex: 0}]);
    });

    it('lets the caller override the frozen sectionIndex', () => {
        const item: Item = {keyForList: '1'};
        const {result} = renderHook(() =>
            useFrozenPreSelection<Item>({
                sections: [{data: [item], sectionIndex: 5}],
                snapshotSource: [item],
                getKey,
                isReady: true,
                visibleCount: longList,
                frozenSectionIndex: 10,
            }),
        );

        expect(result.current.frozenSections).toEqual([{data: [item], sectionIndex: 10}]);
    });
});
