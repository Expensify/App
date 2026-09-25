import type {ChartDataPoint} from '@components/Charts/types';
import {processDataIntoSlices} from '@components/Charts/utils';

/** Key of the single series every point in these tests plots */
const SERIES_KEY = 'primary';

const PIE_GEOMETRY = {centerX: 100, centerY: 100, radius: 100, innerRadius: 80};

describe('processDataIntoSlices', () => {
    it('leaves out a slice whose share the table prints as ~0%', () => {
        // Given a group whose share of total spend rounds away to nothing
        const data: ChartDataPoint[] = [
            {label: 'Large', values: {[SERIES_KEY]: 10000}, percentOfTotal: 99.99},
            {label: 'Sliver', values: {[SERIES_KEY]: 1}, percentOfTotal: 0.01},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, SERIES_KEY, PIE_GEOMETRY);

        // Then only the drawable slice comes back, because at that size the sliver is invisible and impossible
        // to hover or tap, and the inline table still lists the group as ~0%
        expect(slices.map((slice) => slice.label)).toEqual(['Large']);
    });

    it('keeps a slice that sits on the visibility threshold', () => {
        // Given a group at the smallest share the table still prints as a number rather than ~0%
        const data: ChartDataPoint[] = [
            {label: 'Large', values: {[SERIES_KEY]: 99.95}, percentOfTotal: 99.95},
            {label: 'Small', values: {[SERIES_KEY]: 0.05}, percentOfTotal: 0.05},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, SERIES_KEY, PIE_GEOMETRY);

        // Then it is drawn, because the threshold is the point at which the table stops quoting a share, not the
        // first size past it
        expect(slices.map((slice) => slice.label)).toEqual(['Large', 'Small']);
    });

    it('judges a slice by its share rather than by its size on the canvas', () => {
        // Given a credit that offsets most of the spend, so a group that is a large part of the drawn circle is
        // still a negligible share of the search total
        const data: ChartDataPoint[] = [
            {label: 'Spend', values: {[SERIES_KEY]: 5000}, percentOfTotal: 5000},
            {label: 'Refund', values: {[SERIES_KEY]: -4999}, percentOfTotal: -4999},
            {label: 'Rounding', values: {[SERIES_KEY]: 1}, percentOfTotal: 0.01},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, SERIES_KEY, PIE_GEOMETRY);

        // Then the group the table prints as ~0% is the one left out, even though it is not the thinnest slice by
        // absolute value, because the donut and the table have to agree on which groups are negligible
        expect(slices.map((slice) => slice.label)).toEqual(['Spend', 'Refund']);
    });

    it('draws a group the search reports no share for', () => {
        // Given a group-by the backend sends no share for and a total that cancels out, so nothing can be derived
        const data: ChartDataPoint[] = [
            {label: 'First', values: {[SERIES_KEY]: 5000}},
            {label: 'Second', values: {[SERIES_KEY]: -5000}},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, SERIES_KEY, PIE_GEOMETRY);

        // Then both are drawn, because the table prints no share for them either and there is nothing to call
        // negligible
        expect(slices.map((slice) => slice.label)).toEqual(['First', 'Second']);
    });

    it('lays the drawn slices out over the full circle', () => {
        // Given a data set where one group is dropped for being too thin
        const data: ChartDataPoint[] = [
            {label: 'Large', values: {[SERIES_KEY]: 6000}, percentOfTotal: 59.99},
            {label: 'Medium', values: {[SERIES_KEY]: 4000}, percentOfTotal: 39.99},
            {label: 'Sliver', values: {[SERIES_KEY]: 1}, percentOfTotal: 0.01},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, SERIES_KEY, PIE_GEOMETRY);

        // Then the remaining slices share the whole circle between them, because the canvas normalizes the values
        // it is handed and hit testing would otherwise resolve to the wrong slice
        const sweep = slices.reduce((sum, slice) => sum + (slice.endAngle - slice.startAngle), 0);
        expect(sweep).toBeCloseTo(360);
        expect(slices.reduce((sum, slice) => sum + slice.percentage, 0)).toBeCloseTo(100);
    });

    it('keeps each slice pointing at the row it came from', () => {
        // Given a data set whose thinnest group sits in the middle of the array
        const data: ChartDataPoint[] = [
            {label: 'Large', values: {[SERIES_KEY]: 6000}, percentOfTotal: 59.99},
            {label: 'Sliver', values: {[SERIES_KEY]: 1}, percentOfTotal: 0.01},
            {label: 'Medium', values: {[SERIES_KEY]: 4000}, percentOfTotal: 39.99},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, SERIES_KEY, PIE_GEOMETRY);

        // Then the indices still address the original data, because pressing a slice opens that group's
        // transactions and dropping one must not shift what the rest point at
        expect(slices.map((slice) => slice.originalIndex)).toEqual([0, 2]);
    });

    it('draws nothing when every group totals zero', () => {
        // Given groups that all came back empty
        const data: ChartDataPoint[] = [
            {label: 'Nothing', values: {[SERIES_KEY]: 0}},
            {label: 'Also nothing', values: {[SERIES_KEY]: 0}},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, SERIES_KEY, PIE_GEOMETRY);

        // Then there is no donut to draw, because there is no total to divide the circle by
        expect(slices).toEqual([]);
    });
});
