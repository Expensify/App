import type {RawChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import lodashIsObject from 'lodash/isObject';

import parseAttribute from './parseAttribute';

function parseRawChartData(attribute: string): RawChartData[] {
    const data: RawChartData[] = [];
    const parsedValue = parseAttribute(attribute);

    for (const parsedData of Array.isArray(parsedValue) ? parsedValue : []) {
        if (lodashIsObject(parsedData)) {
            if (
                'x' in parsedData &&
                (typeof parsedData.x === 'string' || typeof parsedData.x === 'number') &&
                'y' in parsedData &&
                (typeof parsedData.y === 'string' || typeof parsedData.y === 'number')
            ) {
                const rawChartData: RawChartData = {
                    x: parsedData.x,
                    y: Number(parsedData.y),
                };
                if ('label' in parsedData && typeof parsedData.label === 'string') {
                    rawChartData.label = parsedData.label;
                }
                if ('searchQuery' in parsedData && typeof parsedData.searchQuery === 'string') {
                    rawChartData.searchQuery = parsedData.searchQuery;
                }
                data.push(rawChartData);
            }
        }
    }

    return data;
}

export default parseRawChartData;
