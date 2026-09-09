import {getDragTargetIndex, reorderItems} from '@components/DraggableList/utils';

describe('DraggableList utilities', () => {
    const layouts = [
        {offset: 0, size: 40},
        {offset: 40, size: 60},
        {offset: 100, size: 50},
    ];

    it('targets the measured row nearest to the dragged item center', () => {
        expect(getDragTargetIndex(layouts, 0, 65)).toBe(1);
        expect(getDragTargetIndex(layouts, 2, -110)).toBe(0);
    });

    it('keeps the active index until its layout has been measured', () => {
        expect(getDragTargetIndex([], 2, 100)).toBe(2);
    });

    it('moves only the dragged item and leaves the input untouched', () => {
        const items = ['start', 'middle', 'end'];

        expect(reorderItems(items, 0, 2)).toEqual(['middle', 'end', 'start']);
        expect(items).toEqual(['start', 'middle', 'end']);
    });
});
