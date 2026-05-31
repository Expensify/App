import {renderHook} from '@testing-library/react-native';
import useFrozenPreSelection from '@hooks/useFrozenPreSelection';
import CONST from '@src/CONST';

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
});
