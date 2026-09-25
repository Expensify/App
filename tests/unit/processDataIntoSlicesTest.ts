import type {ChartDataPoint} from '@components/Charts/types';
import {processDataIntoSlices} from '@components/Charts/utils';

const PIE_GEOMETRY = {centerX: 100, centerY: 100, radius: 100, innerRadius: 80};

describe('processDataIntoSlices', () => {
    it('leaves out a slice whose share the table prints as ~0%', () => {
        // Given a group whose share of total spend rounds away to nothing
        const data: ChartDataPoint[] = [
            {label: 'Large', total: 10000, percentOfTotal: 99.99},
            {label: 'Sliver', total: 1, percentOfTotal: 0.01},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, PIE_GEOMETRY);

        // Then only the drawable slice comes back, because at that size the sliver is invisible and impossible
        // to hover or tap, and the inline table still lists the group as ~0%
        expect(slices.map((slice) => slice.label)).toEqual(['Large']);
    });

    it('keeps a slice that sits on the visibility threshold', () => {
        // Given a group at the smallest share the table still prints as a number rather than ~0%
        const data: ChartDataPoint[] = [
            {label: 'Large', total: 99.95, percentOfTotal: 99.95},
            {label: 'Small', total: 0.05, percentOfTotal: 0.05},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, PIE_GEOMETRY);

        // Then it is drawn, because the threshold is the point at which the table stops quoting a share, not the
        // first size past it
        expect(slices.map((slice) => slice.label)).toEqual(['Large', 'Small']);
    });

    it('judges a slice by its share rather than by its size on the canvas', () => {
        // Given a credit that offsets most of the spend, so a group that is a large part of the drawn circle is
        // still a negligible share of the search total
        const data: ChartDataPoint[] = [
            {label: 'Spend', total: 5000, percentOfTotal: 5000},
            {label: 'Refund', total: -4999, percentOfTotal: -4999},
            {label: 'Rounding', total: 1, percentOfTotal: 0.01},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, PIE_GEOMETRY);

        // Then the group the table prints as ~0% is the one left out, even though it is not the thinnest slice by
        // absolute value, because the donut and the table have to agree on which groups are negligible
        expect(slices.map((slice) => slice.label)).toEqual(['Spend', 'Refund']);
    });

    it('draws a group the search reports no share for', () => {
        // Given a group-by the backend sends no share for and a total that cancels out, so nothing can be derived
        const data: ChartDataPoint[] = [
            {label: 'First', total: 5000},
            {label: 'Second', total: -5000},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, PIE_GEOMETRY);

        // Then both are drawn, because the table prints no share for them either and there is nothing to call
        // negligible
        expect(slices.map((slice) => slice.label)).toEqual(['First', 'Second']);
    });

    it('lays the drawn slices out over the full circle', () => {
        // Given a data set where one group is dropped for being too thin
        const data: ChartDataPoint[] = [
            {label: 'Large', total: 6000, percentOfTotal: 59.99},
            {label: 'Medium', total: 4000, percentOfTotal: 39.99},
            {label: 'Sliver', total: 1, percentOfTotal: 0.01},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, PIE_GEOMETRY);

        // Then the remaining slices share the whole circle between them, because the canvas normalizes the values
        // it is handed and hit testing would otherwise resolve to the wrong slice
        const sweep = slices.reduce((sum, slice) => sum + (slice.endAngle - slice.startAngle), 0);
        expect(sweep).toBeCloseTo(360);
        expect(slices.reduce((sum, slice) => sum + slice.percentage, 0)).toBeCloseTo(100);
    });

    it('keeps each slice pointing at the row it came from', () => {
        // Given a data set whose thinnest group sits in the middle of the array
        const data: ChartDataPoint[] = [
            {label: 'Large', total: 6000, percentOfTotal: 59.99},
            {label: 'Sliver', total: 1, percentOfTotal: 0.01},
            {label: 'Medium', total: 4000, percentOfTotal: 39.99},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, PIE_GEOMETRY);

        // Then the indices still address the original data, because pressing a slice opens that group's
        // transactions and dropping one must not shift what the rest point at
        expect(slices.map((slice) => slice.originalIndex)).toEqual([0, 2]);
    });

    it('draws nothing when every group totals zero', () => {
        // Given groups that all came back empty
        const data: ChartDataPoint[] = [
            {label: 'Nothing', total: 0},
            {label: 'Also nothing', total: 0},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, PIE_GEOMETRY);

        // Then there is no donut to draw, because there is no total to divide the circle by
        expect(slices).toEqual([]);
    });
});
