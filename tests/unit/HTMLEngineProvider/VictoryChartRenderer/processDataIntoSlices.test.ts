import {processDataIntoSlices} from '@components/Charts/utils';

describe('processDataIntoSlices', () => {
    const pieGeometry = {centerX: 340, centerY: 265, radius: 145};

    it('preserves data order when sortByValue is false', () => {
        const data = [
            {label: 'Small', total: 100},
            {label: 'Large', total: 500},
            {label: 'Medium', total: 300},
        ];

        const slices = processDataIntoSlices(data, pieGeometry, 270, false);

        expect(slices.map((slice) => slice.originalIndex)).toEqual([0, 1, 2]);
        expect(slices.at(0)?.label).toBe('Small');
        expect(slices.at(1)?.label).toBe('Large');
        expect(slices.at(2)?.label).toBe('Medium');
    });

    it('sorts by descending value by default', () => {
        const data = [
            {label: 'Small', total: 100},
            {label: 'Large', total: 500},
            {label: 'Medium', total: 300},
        ];

        const slices = processDataIntoSlices(data, pieGeometry, 270);

        expect(slices.map((slice) => slice.label)).toEqual(['Large', 'Medium', 'Small']);
    });
});
