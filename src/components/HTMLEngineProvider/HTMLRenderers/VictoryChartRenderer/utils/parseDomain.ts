import lodashIsObject from 'lodash/isObject';
import type {CartesianChartProps} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from './parseAttribute';

type Domain = CartesianChartProps['domain'];

/**
 * Translate VictoryChart's `domain` attribute into victory-native's `domain` shape.
 */
function parseDomain(attribute: string): Domain {
    const domain = parseAttribute(attribute);
    if (Array.isArray(domain)) {
        return {
            y: [Number(domain.at(0)), Number(domain.at(1))],
        };
    }
    if (lodashIsObject(domain)) {
        let x: [number, number] | undefined;
        let y: [number, number] | undefined;
        if ('x' in domain && Array.isArray(domain.x)) {
            x = [Number(domain.x.at(0)), Number(domain.x.at(1))];
        }
        if ('y' in domain && Array.isArray(domain.y)) {
            y = [Number(domain.y.at(0)), Number(domain.y.at(1))];
        }
        return {x, y};
    }
    return undefined;
}

export default parseDomain;
