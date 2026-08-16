import type {RawLegendData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import lodashIsObject from 'lodash/isObject';

import parseAttribute from './parseAttribute';

function parseRawLegendData(attribute: string): RawLegendData[] {
    const data: RawLegendData[] = [];
    const parsedValue = parseAttribute(attribute);

    for (const parsedData of Array.isArray(parsedValue) ? parsedValue : []) {
        if (lodashIsObject(parsedData) && 'name' in parsedData && typeof parsedData.name === 'string') {
            const item: RawLegendData = {name: parsedData.name};
            if ('symbol' in parsedData && lodashIsObject(parsedData.symbol)) {
                item.symbol = {};
                if ('fill' in parsedData.symbol && (typeof parsedData.symbol.fill === 'string' || typeof parsedData.symbol.fill === 'number')) {
                    item.symbol.fill = parsedData.symbol.fill;
                }
                if ('size' in parsedData.symbol && (typeof parsedData.symbol.size === 'string' || typeof parsedData.symbol.size === 'number')) {
                    item.symbol.size = parsedData.symbol.size;
                }
            }
            data.push(item);
        }
    }

    return data;
}

export default parseRawLegendData;
