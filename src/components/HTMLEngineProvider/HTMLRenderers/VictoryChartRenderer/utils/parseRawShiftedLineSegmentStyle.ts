import type {RawShiftedLineSegmentStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import lodashIsObject from 'lodash/isObject';

import parseAttribute from './parseAttribute';

function parseRawShiftedLineSegmentStyle(attribute: string): RawShiftedLineSegmentStyle {
    const style: RawShiftedLineSegmentStyle = {};
    const parsedValue = parseAttribute(attribute);

    if (lodashIsObject(parsedValue)) {
        if ('stroke' in parsedValue && (typeof parsedValue.stroke === 'string' || typeof parsedValue.stroke === 'number')) {
            style.stroke = parsedValue.stroke;
        }
        if ('strokeWidth' in parsedValue && (typeof parsedValue.strokeWidth === 'string' || typeof parsedValue.strokeWidth === 'number')) {
            style.strokeWidth = Number(parsedValue.strokeWidth);
        }
    }

    return style;
}

export default parseRawShiftedLineSegmentStyle;
