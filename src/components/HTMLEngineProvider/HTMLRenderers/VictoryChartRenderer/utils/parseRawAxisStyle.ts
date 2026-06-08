import lodashIsObject from 'lodash/isObject';
import type {RawAxisStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from './parseAttribute';

/**
 * Translate VictoryChart's `interpolation` attribute into victory-native's `curveType` attribute.
 */
function parseRawAxisStyle(attribute: string): RawAxisStyle {
    const style: RawAxisStyle = {};
    const parsedValue = parseAttribute(attribute);

    if (lodashIsObject(parsedValue)) {
        if ('grid' in parsedValue && lodashIsObject(parsedValue.grid)) {
            style.grid = {};
            if ('stroke' in parsedValue.grid && (typeof parsedValue.grid.stroke === 'string' || typeof parsedValue.grid.stroke === 'number')) {
                style.grid.stroke = parsedValue.grid.stroke;
            }
            if ('strokeWidth' in parsedValue.grid && (typeof parsedValue.grid.strokeWidth === 'string' || typeof parsedValue.grid.strokeWidth === 'number')) {
                style.grid.strokeWidth = Number(parsedValue.grid.strokeWidth);
            }
        }
        if ('tickLabels' in parsedValue && lodashIsObject(parsedValue.tickLabels)) {
            style.tickLabels = {};
            if ('fill' in parsedValue.tickLabels && (typeof parsedValue.tickLabels.fill === 'string' || typeof parsedValue.tickLabels.fill === 'number')) {
                style.tickLabels.fill = parsedValue.tickLabels.fill;
            }
            if ('padding' in parsedValue.tickLabels && (typeof parsedValue.tickLabels.padding === 'string' || typeof parsedValue.tickLabels.padding === 'number')) {
                style.tickLabels.padding = parsedValue.tickLabels.padding;
            }
            if ('fontSize' in parsedValue.tickLabels && (typeof parsedValue.tickLabels.fontSize === 'string' || typeof parsedValue.tickLabels.fontSize === 'number')) {
                style.tickLabels.fontSize = parsedValue.tickLabels.fontSize;
            }
        }
    }

    return style;
}

export default parseRawAxisStyle;
