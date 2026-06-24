import lodashIsObject from 'lodash/isObject';
import type {CartesianChartProps} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from './parseAttribute';

type DomainPadding = CartesianChartProps['domainPadding'];

/**
 * Translate VictoryChart's `domainPadding` attribute into victory-native's `domainPadding` shape.
 */
function parseDomainPadding(attribute: string, isHorizontal: boolean): DomainPadding {
    const domainPadding = parseAttribute(attribute);
    if (typeof domainPadding === 'number') {
        return domainPadding;
    }
    if (Array.isArray(domainPadding)) {
        return isHorizontal ? {bottom: Number(domainPadding.at(0)), top: Number(domainPadding.at(1))} : {left: Number(domainPadding.at(0)), right: Number(domainPadding.at(1))};
    }
    if (lodashIsObject(domainPadding)) {
        let left: number | undefined;
        let right: number | undefined;
        let top: number | undefined;
        let bottom: number | undefined;
        if ('x' in domainPadding && typeof domainPadding.x === 'number') {
            left = domainPadding.x;
            right = domainPadding.x;
        } else if ('x' in domainPadding && Array.isArray(domainPadding.x)) {
            left = Number(domainPadding.x.at(0));
            right = Number(domainPadding.x.at(1));
        }
        if ('y' in domainPadding && typeof domainPadding.y === 'number') {
            top = domainPadding.y;
            bottom = domainPadding.y;
        } else if ('y' in domainPadding && Array.isArray(domainPadding.y)) {
            top = Number(domainPadding.y.at(1));
            bottom = Number(domainPadding.y.at(0));
        }
        return isHorizontal ? {left: bottom, right: top, top: right, bottom: left} : {left, right, top, bottom};
    }
    return undefined;
}

export default parseDomainPadding;
