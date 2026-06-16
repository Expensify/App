import lodashIsObject from 'lodash/isObject';
import type {RawLabelStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from './parseAttribute';

function parseRawLabelStyle(attribute: string): RawLabelStyle[] {
    const style: RawLabelStyle[] = [];
    const parsedValue = parseAttribute(attribute);

    for (const parsedStyle of Array.isArray(parsedValue) ? parsedValue : [parsedValue]) {
        if (lodashIsObject(parsedStyle)) {
            const textStyle: RawLabelStyle = {};
            if ('fill' in parsedStyle && (typeof parsedStyle.fill === 'string' || typeof parsedStyle.fill === 'number')) {
                textStyle.fill = parsedStyle.fill;
            }
            if ('fontSize' in parsedStyle && (typeof parsedStyle.fontSize === 'string' || typeof parsedStyle.fontSize === 'number')) {
                textStyle.fontSize = parsedStyle.fontSize;
            }
            if ('fontWeight' in parsedStyle && (typeof parsedStyle.fontWeight === 'string' || typeof parsedStyle.fontWeight === 'number')) {
                textStyle.fontWeight = parsedStyle.fontWeight;
            }
            if ('fontFamily' in parsedStyle && typeof parsedStyle.fontFamily === 'string') {
                textStyle.fontFamily = parsedStyle.fontFamily;
            }
            if ('fontStyle' in parsedStyle && typeof parsedStyle.fontStyle === 'string') {
                textStyle.fontStyle = parsedStyle.fontStyle;
            }
            style.push(textStyle);
        }
    }

    return style;
}

export default parseRawLabelStyle;
