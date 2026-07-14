import parseRawAxisStyle from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawAxisStyle';
import parseRawChartData from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawChartData';
import parseRawLabelStyle from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawLabelStyle';
import parseRawLegendData from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawLegendData';
import parseRawLegendStyle from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawLegendStyle';
import parseRawShiftedLineSegmentStyle from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawShiftedLineSegmentStyle';

describe('parseRawChartData', () => {
    it.each(['oops', '5', '{}'])('returns empty entries when data is not an array (%p)', (data) => {
        const result = parseRawChartData(data);
        expect(result).toEqual([]);
    });

    it('skips invalid entries and properties', () => {
        const result = parseRawChartData("[null, 5, 'x', {name: 'A'}, {x: 'test'}, {x: 'abc', y: '10'}, {x: 'water', y: 15, label: 5, searchQuery: {}}]");
        expect(result).toEqual([
            {x: 'abc', y: 10},
            {x: 'water', y: 15},
        ]);
    });

    it('preserves supported point metadata', () => {
        const result = parseRawChartData("[{x: 1, y: 20, label: 'Jan 2026: $20', searchQuery: 'type:expense date>=2026-01-01 date<2026-02-01'}]");
        expect(result).toEqual([
            {
                x: 1,
                y: 20,
                label: 'Jan 2026: $20',
                searchQuery: 'type:expense date>=2026-01-01 date<2026-02-01',
            },
        ]);
    });
});

describe('parseRawLabelStyle', () => {
    it('skips invalid properties (passing a single object)', () => {
        const result = parseRawLabelStyle("{fill: 'green', fontStyle: 123, fontFamily: 'Expensify Neue'}");
        expect(result).toEqual([{fill: 'green', fontFamily: 'Expensify Neue'}]);
    });

    it('skips invalid entries and properties (passing an array)', () => {
        const result = parseRawLabelStyle("[null, 5, 'x', {name: 'A'}, {x: 'test'}, {fontSize: 20}, {fill: 'green', fontStyle: 123, fontFamily: 'Expensify Neue'}]");
        expect(result).toEqual([{}, {}, {fontSize: 20}, {fill: 'green', fontFamily: 'Expensify Neue'}]);
    });
});

describe('parseRawAxisStyle', () => {
    it.each(['oops', '5', '[]', '{{'])('returns an empty object when data is not an object (%p)', (data) => {
        const result = parseRawAxisStyle(data);
        expect(result).toEqual({});
    });

    it('skips invalid properties', () => {
        const result = parseRawAxisStyle("{grid: {stroke: 'blue', strokeWidth: 1}, tickLabels: {padding: [], fontSize: {}, fill: 'green'}}");
        expect(result).toEqual({grid: {stroke: 'blue', strokeWidth: 1}, tickLabels: {fill: 'green'}});
    });
});

describe('parseRawLegendData', () => {
    it.each(['oops', '5', '{}'])('returns empty entries when data is not an array (%p)', (data) => {
        const result = parseRawLegendData(data);
        expect(result).toEqual([]);
    });

    it('skips invalid entries and properties', () => {
        const result = parseRawLegendData("[null, 5, 'x', {name: 'A'}, {symbol: {size: 4}}, {name: 'B', symbol: {size: 8}}]");
        expect(result).toEqual([{name: 'A'}, {name: 'B', symbol: {size: 8}}]);
    });
});

describe('parseRawLegendStyle', () => {
    it.each(['oops', '5', '[]', '{{'])('returns an empty object when data is not an object (%p)', (data) => {
        const result = parseRawLegendStyle(data);
        expect(result).toEqual({});
    });

    it('skips invalid properties', () => {
        const result = parseRawLegendStyle("{test: {}, labels: {fontWeight: 'bold', fontFamily: 5, fontStyle: 5}}");
        expect(result).toEqual({labels: {fontWeight: 'bold'}});
    });
});

describe('parseRawShiftedLineSegmentStyle', () => {
    it.each(['oops', '5', '[]', '{{'])('returns an empty object when data is not an object (%p)', (data) => {
        const result = parseRawShiftedLineSegmentStyle(data);
        expect(result).toEqual({});
    });

    it('skips invalid properties', () => {
        const result = parseRawShiftedLineSegmentStyle("{test: {}, stroke: {}, strokeWidth: '4'}");
        expect(result).toEqual({strokeWidth: 4});
    });
});
