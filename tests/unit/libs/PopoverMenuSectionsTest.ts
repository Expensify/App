import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';

import {REPORT_MORE_MENU_SECTIONS, sortAndSectionPopoverMenuItems, TRANSACTION_MORE_MENU_SECTIONS} from '@libs/PopoverMenuSections';

import CONST from '@src/CONST';

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

    it('keeps the received payment action in the first section instead of pushing it to the end', () => {
        expect(REPORT_MORE_MENU_SECTIONS.at(0)).toContain(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT);

        const items = [makeItem(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT), makeItem(CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS)];
        const result = sortAndSectionPopoverMenuItems(items, REPORT_MORE_MENU_SECTIONS);

        expect(result.at(0)?.value).toBe(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT);
        expect(result.at(0)?.addSeparatorBefore).toBeUndefined();
    });

    it('renders SEND_TO_SOMEONE and SEND_TO_EMPLOYER first, together in the top section with a divider before the next section', () => {
        expect(TRANSACTION_MORE_MENU_SECTIONS.at(0)).toEqual([CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SEND_TO_SOMEONE, CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SEND_TO_EMPLOYER]);

        const items = [
            makeItem(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS),
            makeItem(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SEND_TO_EMPLOYER),
            makeItem(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SEND_TO_SOMEONE),
        ];
        const result = sortAndSectionPopoverMenuItems(items, TRANSACTION_MORE_MENU_SECTIONS);

        // Both convert-from-track rows sort to the top section, in their original order, with no divider between them.
        expect(result.map((item) => item.value)).toEqual([
            CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SEND_TO_EMPLOYER,
            CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SEND_TO_SOMEONE,
            CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS,
        ]);
        expect(result.at(0)?.addSeparatorBefore).toBeUndefined();
        expect(result.at(1)?.addSeparatorBefore).toBeUndefined();
        // VIEW_DETAILS is in a later section, so it gets the divider.
        expect(result.at(2)?.addSeparatorBefore).toBe(true);
    });
});
