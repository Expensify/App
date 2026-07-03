import useFrozenPreSelection from '@hooks/useFrozenPreSelection';

import CONST from '@src/CONST';

import {renderHook} from '@testing-library/react-native';

type Item = {
    keyForList: string;
    text?: string;
    isSelected?: boolean;
};

type Section = {data: Item[]; sectionIndex: number};

const padTo = (target: number, existing: Item[]): Section[] => {
    const filler: Item[] = [];
    for (let i = existing.length; i < target; i++) {
        filler.push({keyForList: `filler-${i}`});
    }
    return [{data: [...existing, ...filler], sectionIndex: 1}];
};

const longList = CONST.STANDARD_LIST_ITEM_LIMIT;

describe('useFrozenPreSelection', () => {
    it('returns input unchanged while canCapture is false', () => {
        const item: Item = {keyForList: '1'};
        const sections = padTo(longList, [item]);
        const {result} = renderHook(() => useFrozenPreSelection<Item>(sections, {initialSelectedValues: ['1'], canCapture: false}));

        expect(result.current).toBe(sections);
    });

    it('pins pre-selected rows in a new top section and removes them from the input sections', () => {
        const pinned: Item = {keyForList: '1', isSelected: true};
        const other: Item = {keyForList: '2'};
        const sections = padTo(longList, [pinned, other]);
        const {result} = renderHook(() => useFrozenPreSelection<Item>(sections, {initialSelectedValues: ['1'], canCapture: true}));

        expect(result.current.at(0)).toEqual({data: [pinned], sectionIndex: 0});
        expect(result.current.at(1)?.data.some((item) => item.keyForList === '1')).toBe(false);
        expect(result.current.at(1)?.data.some((item) => item.keyForList === '2')).toBe(true);
    });

    it('returns input unchanged when the combined item count is below the threshold', () => {
        const item: Item = {keyForList: '1'};
        const sections: Section[] = [{data: [item], sectionIndex: 1}];
        const {result} = renderHook(() => useFrozenPreSelection<Item>(sections, {initialSelectedValues: ['1'], canCapture: true}));

        expect(result.current).toBe(sections);
    });

    it('locks the snapshot once captured, even when initialSelectedValues changes later', () => {
        const captured: Item = {keyForList: '1'};
        const newcomer: Item = {keyForList: '99'};
        const initialSections = padTo(longList, [captured, newcomer]);
        const {result, rerender} = renderHook(
            ({sections, initialSelectedValues}: {sections: Section[]; initialSelectedValues: string[]}) => useFrozenPreSelection<Item>(sections, {initialSelectedValues, canCapture: true}),
            {initialProps: {sections: initialSections, initialSelectedValues: ['1']}},
        );

        expect(result.current.at(0)?.data).toEqual([captured]);

        rerender({sections: initialSections, initialSelectedValues: ['99']});

        expect(result.current.at(0)?.data).toEqual([captured]);
    });

    it('preserves capture order across renders, using the live row from input sections', () => {
        const a: Item = {keyForList: 'a'};
        const b: Item = {keyForList: 'b'};
        const initialSections = padTo(longList, [b, a]);
        const {result, rerender} = renderHook(({sections}: {sections: Section[]}) => useFrozenPreSelection<Item>(sections, {initialSelectedValues: ['a', 'b'], canCapture: true}), {
            initialProps: {sections: initialSections},
        });

        // Capture order follows traversal of sections — b appears before a.
        expect(result.current.at(0)?.data.map((item) => item.keyForList)).toEqual(['b', 'a']);

        // Live row replaces the captured row so toggles refresh in place.
        const aLive: Item = {keyForList: 'a', isSelected: false};
        const bLive: Item = {keyForList: 'b', isSelected: true};
        rerender({sections: padTo(longList, [bLive, aLive])});

        expect(result.current.at(0)?.data).toEqual([bLive, aLive]);
    });

    it('drops frozen items that are not present in any input section', () => {
        const visible: Item = {keyForList: 'visible'};
        const sections = padTo(longList, [visible]);
        const {result} = renderHook(() => useFrozenPreSelection<Item>(sections, {initialSelectedValues: ['missing', 'visible'], canCapture: true}));

        expect(result.current.at(0)?.data).toEqual([visible]);
    });

    it('returns input unchanged when no initialSelectedValues match anything in sections', () => {
        const sections = padTo(longList, [{keyForList: 'visible'}]);
        const {result} = renderHook(() => useFrozenPreSelection<Item>(sections, {initialSelectedValues: ['nothing-matches'], canCapture: true}));

        expect(result.current).toBe(sections);
    });

    it('returns input unchanged when initialSelectedValues is empty', () => {
        const sections = padTo(longList, [{keyForList: 'visible'}]);
        const {result} = renderHook(() => useFrozenPreSelection<Item>(sections, {initialSelectedValues: [], canCapture: true}));

        expect(result.current).toBe(sections);
    });

    it('with shouldRenderPinned, retains pinned rows even when they are absent from input sections', () => {
        const pinned: Item = {keyForList: 'pinned'};
        const initialSections = padTo(longList, [pinned]);
        const {result, rerender} = renderHook(
            ({sections}: {sections: Section[]}) => useFrozenPreSelection<Item>(sections, {initialSelectedValues: ['pinned'], canCapture: true, shouldRenderPinned: () => true}),
            {
                initialProps: {sections: initialSections},
            },
        );

        // While the row is in the input sections, the live copy surfaces (no isSelected on the live row).
        expect(result.current.at(0)?.data).toEqual([pinned]);

        // Simulate a search filtering "pinned" out of the input sections — the captured copy (initialized
        // with isSelected: false at capture time) should still surface.
        rerender({sections: padTo(longList, [{keyForList: 'other'}])});

        expect(result.current.at(0)?.data).toEqual([{keyForList: 'pinned', isSelected: false}]);
    });

    it('with shouldRenderPinned, drops pinned rows for which the predicate returns false', () => {
        const matching: Item = {keyForList: 'match'};
        const filtered: Item = {keyForList: 'filtered'};
        const sections = padTo(longList, [matching, filtered]);
        const {result} = renderHook(() =>
            useFrozenPreSelection<Item>(sections, {
                initialSelectedValues: ['match', 'filtered'],
                canCapture: true,
                shouldRenderPinned: (item) => item.keyForList === 'match',
            }),
        );

        expect(result.current.at(0)?.data).toEqual([matching]);
    });

    it('with shouldRenderPinned, omits the top section entirely when the predicate filters everything out', () => {
        const filtered: Item = {keyForList: 'filtered'};
        const other: Item = {keyForList: 'other'};
        const sections = padTo(longList, [filtered, other]);
        const {result} = renderHook(() =>
            useFrozenPreSelection<Item>(sections, {
                initialSelectedValues: ['filtered'],
                canCapture: true,
                shouldRenderPinned: () => false,
            }),
        );

        // No frozen section at the top, but "filtered" is still removed from the input section because it was captured.
        expect(result.current.at(0)?.data.some((item) => item.keyForList === 'filtered')).toBe(false);
        expect(result.current.at(0)?.data.some((item) => item.keyForList === 'other')).toBe(true);
    });

    it('with getKey, matches items against initialSelectedValues using the extractor instead of keyForList', () => {
        type ItemWithAccountID = Item & {accountID: number};
        const pinned: ItemWithAccountID = {keyForList: 'report-1', accountID: 1};
        const other: ItemWithAccountID = {keyForList: 'report-2', accountID: 2};
        const filler: ItemWithAccountID[] = [];
        for (let i = 0; i < longList - 2; i++) {
            filler.push({keyForList: `report-${i + 3}`, accountID: i + 3});
        }
        const sections: Array<{data: ItemWithAccountID[]; sectionIndex: number}> = [{data: [pinned, other, ...filler], sectionIndex: 1}];

        const {result} = renderHook(() =>
            useFrozenPreSelection<ItemWithAccountID>(sections, {
                initialSelectedValues: ['1'],
                canCapture: true,
                getKey: (item) => item.accountID.toString(),
            }),
        );

        expect(result.current.at(0)?.data).toEqual([pinned]);
        expect(result.current.at(1)?.data.some((item) => item.keyForList === 'report-1')).toBe(false);
    });

    it('does not re-capture on later renders after capturing an empty snapshot below the threshold', () => {
        const item: Item = {keyForList: '1'};
        const initialSections: Section[] = [{data: [item], sectionIndex: 1}];
        const {result, rerender} = renderHook(({sections}: {sections: Section[]}) => useFrozenPreSelection<Item>(sections, {initialSelectedValues: ['1'], canCapture: true}), {
            initialProps: {sections: initialSections},
        });

        // Below threshold on first render → empty snapshot captured.
        expect(result.current).toBe(initialSections);

        // List grows past the threshold on a later render; snapshot stays empty, no pinning.
        const grownSections = padTo(longList, [item]);
        rerender({sections: grownSections});

        expect(result.current).toBe(grownSections);
    });
});
