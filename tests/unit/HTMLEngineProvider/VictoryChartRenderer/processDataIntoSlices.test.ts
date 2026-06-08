import {processDataIntoSlices} from '@components/Charts/utils';

describe('processDataIntoSlices', () => {
    const pieGeometry = {centerX: 340, centerY: 265, radius: 145, innerRadius: 0};

    it('sorts by descending value', () => {
        const data = [
            {label: 'Small', total: 100},
            {label: 'Large', total: 500},
            {label: 'Medium', total: 300},
        ];

        const slices = processDataIntoSlices(data, pieGeometry, 270);

        expect(slices.map((slice) => slice.label)).toEqual(['Large', 'Medium', 'Small']);
    });
});
