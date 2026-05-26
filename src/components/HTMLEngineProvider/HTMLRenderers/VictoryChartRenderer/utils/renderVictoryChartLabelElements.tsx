import {Skia, Text as SkText} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartTypefaces} from '@components/Charts/types';
import {getChartLabelTypeface, isBoldFontWeight} from '@components/Charts/utils/getChartLabelTypeface';
import type {LabelItem, RawLabelStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type RenderVictoryChartLabelElementsParams = {
    labelItems: LabelItem[];
    typefaces: ChartTypefaces;
};

function getLineStyle(labelItem: LabelItem, lineIndex: number): Pick<LabelItem, 'color' | 'fontSize' | 'fontWeight' | 'fontFamily'> & Pick<RawLabelStyle, 'fontStyle'> {
    const style = labelItem.styles?.at(lineIndex);
    if (!style) {
        return {
            color: labelItem.color,
            fontSize: labelItem.fontSize,
            fontWeight: labelItem.fontWeight,
            fontFamily: labelItem.fontFamily,
        };
    }

    return {
        color: style.fill,
        fontSize: style.fontSize !== undefined ? Number(style.fontSize) : labelItem.fontSize,
        fontWeight: isBoldFontWeight(style.fontWeight) ? 'bold' : labelItem.fontWeight,
        fontFamily: style.fontFamily ?? labelItem.fontFamily,
        fontStyle: style.fontStyle,
    };
}

function getTextX(anchorX: number, lineWidth: number, textAnchor: LabelItem['textAnchor']): number {
    if (textAnchor === 'middle') {
        return anchorX - lineWidth / 2;
    }
    if (textAnchor === 'end') {
        return anchorX - lineWidth;
    }
    return anchorX;
}

type LineLayout = {
    text: string;
    width: number;
    height: number;
    fontSize: number;
    color?: RawLabelStyle['fill'];
    fontFamily?: string;
    fontStyle?: string;
    fontWeight?: LabelItem['fontWeight'];
};

function buildLineLayouts(labelItem: LabelItem, typefaces: ChartTypefaces): LineLayout[] {
    const lines = labelItem.text.split('\n');

    return lines.map((line, index) => {
        const {color, fontSize = 11, fontWeight, fontFamily, fontStyle} = getLineStyle(labelItem, index);
        const typeface = getChartLabelTypeface(typefaces, {fontFamily, fontWeight, fontStyle});
        const font = typeface ? Skia.Font(typeface, fontSize) : null;
        const lineHeightMultiplier = labelItem.lineHeight?.at(index) ?? 1.2;
        const height = fontSize * lineHeightMultiplier;
        const width = font?.getGlyphWidths(font.getGlyphIDs(line)).reduce((acc, glyphWidth) => acc + glyphWidth, 0) ?? 0;

        return {
            text: line,
            width,
            height,
            fontSize,
            color,
            fontFamily,
            fontStyle,
            fontWeight,
        };
    });
}

/**
 * Returns Skia Text elements for floating `<victorylabel>` nodes.
 * Kept as a plain element factory so labels render reliably inside Skia canvases.
 */
function renderVictoryChartLabelElements({labelItems, typefaces}: RenderVictoryChartLabelElementsParams): React.ReactElement[] {
    return labelItems.flatMap((labelItem, labelIndex) => {
        const {x, y, textAnchor, verticalAnchor} = labelItem;
        const lineLayouts = buildLineLayouts(labelItem, typefaces);
        const totalHeight = lineLayouts.reduce((acc, line) => acc + line.height, 0);
        let currentY = y;

        if (verticalAnchor === 'middle') {
            currentY = y - totalHeight / 2;
        } else if (verticalAnchor === 'end') {
            currentY = y - totalHeight;
        }

        return lineLayouts.flatMap((line, index) => {
            const typeface = getChartLabelTypeface(typefaces, {
                fontFamily: line.fontFamily,
                fontWeight: line.fontWeight,
                fontStyle: line.fontStyle,
            });
            const font = typeface ? Skia.Font(typeface, line.fontSize) : null;

            if (!font) {
                return [];
            }

            const textX = getTextX(x, line.width, textAnchor);
            const lineOffset = lineLayouts.slice(0, index).reduce((acc, previousLine) => acc + previousLine.height, 0);
            const textY = currentY + lineOffset + line.fontSize;

            return [
                <SkText
                    key={`text-${labelIndex}-${index}`}
                    x={textX}
                    y={textY}
                    text={line.text}
                    font={font}
                    color={line.color}
                />,
            ];
        });
    });
}

export default renderVictoryChartLabelElements;
