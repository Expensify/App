import type {Color} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';
import type {PartialProcessNodeResult, PieChartConfig, PolarChartDatum, RawChartData, RawLabelStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseColorScale, {getPieSliceColor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseColorScale';
import parseEmbeddedComponentAttributes from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseEmbeddedComponent';
import unescapeLabelText from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/unescapeLabelText';

type PieSliceStyle = {
    data?: {
        stroke?: Color;
        strokeWidth?: string | number;
    };
};

/**
 * Parse label component config from a `<victorylabel>` embedded in the `labelcomponent` attribute.
 */
function parseLabelComponent(labelComponent: string | undefined): Pick<PieChartConfig, 'labelComponentLineHeights' | 'labelComponentStyles'> {
    if (!labelComponent) {
        return {};
    }

    const attributes = parseEmbeddedComponentAttributes(labelComponent);
    const lineHeights = parseAttribute<number[]>(attributes.lineheight);
    const styles = parseAttribute<RawLabelStyle[]>(attributes.style);

    return {
        labelComponentLineHeights: lineHeights,
        labelComponentStyles: styles,
    };
}

/**
 * Parse label indicator config from a `<shiftedlinesegment>` embedded in the `labelindicator` attribute.
 */
function parseLabelIndicator(labelIndicator: string | undefined): Pick<PieChartConfig, 'labelIndicatorDy' | 'labelIndicatorStroke' | 'labelIndicatorStrokeWidth'> {
    if (!labelIndicator) {
        return {};
    }

    const attributes = parseEmbeddedComponentAttributes(labelIndicator);
    const style = parseAttribute<{stroke?: Color; strokeWidth?: string | number}>(attributes.style);

    return {
        labelIndicatorDy: parseAttribute<number>(attributes.dy),
        labelIndicatorStroke: style?.stroke,
        labelIndicatorStrokeWidth: style?.strokeWidth !== undefined ? Number(style.strokeWidth) : undefined,
    };
}

/**
 * Parse data and styling config from a `<victorypie>` node.
 */
function parseVictoryPieNode(tnode: TNode): PartialProcessNodeResult {
    const points = parseAttribute<RawChartData[]>(tnode.attributes.data) ?? [];
    const labels = parseAttribute<string[]>(tnode.attributes.labels) ?? [];
    const colorScale = parseColorScale(tnode.attributes.colorscale);
    const style = parseAttribute<PieSliceStyle>(tnode.attributes.style);

    const polarData: PolarChartDatum[] = points.map((point, index) => ({
        x: String(point.x),
        y: point.y,
        label: unescapeLabelText(labels.at(index) ?? String(point.x)),
        color: getPieSliceColor(colorScale, index),
    }));

    const pieConfig: PieChartConfig = {
        innerRadius: parseAttribute<number>(tnode.attributes.innerradius) ?? 0,
        radius: parseAttribute<number>(tnode.attributes.radius),
        padAngle: parseAttribute<number>(tnode.attributes.padangle) ?? 0,
        labelRadius: parseAttribute<number>(tnode.attributes.labelradius),
        colorScale,
        strokeColor: style?.data?.stroke,
        strokeWidth: style?.data?.strokeWidth !== undefined ? Number(style.data.strokeWidth) : undefined,
        labelIndicatorInnerOffset: parseAttribute<number>(tnode.attributes.labelindicatorinneroffset),
        labelIndicatorOuterOffset: parseAttribute<number>(tnode.attributes.labelindicatorouteroffset),
        ...parseLabelComponent(tnode.attributes.labelcomponent),
        ...parseLabelIndicator(tnode.attributes.labelindicator),
    };

    return {polarData, pieConfig};
}

export default parseVictoryPieNode;
