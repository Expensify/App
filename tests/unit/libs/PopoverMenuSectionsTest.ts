import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';

import {sortAndSectionPopoverMenuItems} from '@libs/PopoverMenuSections';

function makeItem(value: string): DropdownOption<string> {
    return {text: value, value};
}

describe('sortAndSectionPopoverMenuItems', () => {
    const sections = [['A', 'B', 'C'], ['D', 'E'], ['F']];

    it('adds separators between sections', () => {
        const items = [makeItem('A'), makeItem('D'), makeItem('F')];
        const result = sortAndSectionPopoverMenuItems(items, sections);

        expect(result).toHaveLength(3);
        expect(result.at(0)?.addSeparatorBefore).toBeUndefined();
        expect(result.at(1)?.addSeparatorBefore).toBe(true);
        expect(result.at(2)?.addSeparatorBefore).toBe(true);
    });

    it('does not add separator when all items are in the same section', () => {
        const items = [makeItem('A'), makeItem('B'), makeItem('C')];
        const result = sortAndSectionPopoverMenuItems(items, sections);

        expect(result.every((i) => !i.addSeparatorBefore)).toBe(true);
    });

    it('sorts items by section order while preserving original order within sections', () => {
        const items = [makeItem('F'), makeItem('B'), makeItem('D'), makeItem('A')];
        const result = sortAndSectionPopoverMenuItems(items, sections);

        expect(result.map((i) => i.value)).toEqual(['B', 'A', 'D', 'F']);
    });

    it('places unrecognized items at the end', () => {
        const items = [makeItem('UNKNOWN'), makeItem('A'), makeItem('D')];
        const result = sortAndSectionPopoverMenuItems(items, sections);

        expect(result.map((i) => i.value)).toEqual(['A', 'D', 'UNKNOWN']);
        expect(result.at(2)?.addSeparatorBefore).toBe(true);
    });

    it('returns empty array for empty input', () => {
        expect(sortAndSectionPopoverMenuItems([], sections)).toEqual([]);
    });

    it('handles single item without separator', () => {
        const result = sortAndSectionPopoverMenuItems([makeItem('D')], sections);

        expect(result).toEqual([{text: 'D', value: 'D'}]);
    });
});
