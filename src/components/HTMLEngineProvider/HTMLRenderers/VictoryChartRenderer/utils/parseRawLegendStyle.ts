import lodashIsObject from 'lodash/isObject';
import type {RawLegendStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from './parseAttribute';

function parseRawLegendStyle(attribute: string): RawLegendStyle {
    const style: RawLegendStyle = {};
    const parsedValue = parseAttribute(attribute);

    if (lodashIsObject(parsedValue)) {
        if ('labels' in parsedValue && lodashIsObject(parsedValue.labels)) {
            style.labels = {};
            if ('fill' in parsedValue.labels && (typeof parsedValue.labels.fill === 'string' || typeof parsedValue.labels.fill === 'number')) {
                style.labels.fill = parsedValue.labels.fill;
            }
            if ('fontSize' in parsedValue.labels && (typeof parsedValue.labels.fontSize === 'string' || typeof parsedValue.labels.fontSize === 'number')) {
                style.labels.fontSize = parsedValue.labels.fontSize;
            }
            if ('fontWeight' in parsedValue.labels && (typeof parsedValue.labels.fontWeight === 'string' || typeof parsedValue.labels.fontWeight === 'number')) {
                style.labels.fontWeight = parsedValue.labels.fontWeight;
            }
            if ('fontFamily' in parsedValue.labels && typeof parsedValue.labels.fontFamily === 'string') {
                style.labels.fontFamily = parsedValue.labels.fontFamily;
            }
            if ('fontStyle' in parsedValue.labels && typeof parsedValue.labels.fontStyle === 'string') {
                style.labels.fontStyle = parsedValue.labels.fontStyle;
            }
        }
    }

    return style;
}

export default parseRawLegendStyle;
