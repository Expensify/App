import lodashIsObject from 'lodash/isObject';
import type {RawChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
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
                data.push({
                    x: parsedData.x,
                    y: Number(parsedData.y),
                });
            }
        }
    }

    return data;
}

export default parseRawChartData;
