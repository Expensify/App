import type {TNode} from 'react-native-render-html';
import parseAttribute from './parseAttribute';

type VictoryPieLayout = {
    /** Outer radius parsed from HTML, when present */
    radius?: number;

    /** Inner radius parsed from HTML */
    innerRadius: number;

    /** Pie diameter passed to Pie.Chart (`radius * 2`), undefined when HTML omits radius */
    size?: number;

    /** Radius used for tooltip hit-testing; matches Pie.Chart when radius is explicit */
    hitTestRadius: number;

    /** Center point for tooltip hit-testing within the chart canvas */
    centerX: number;
    centerY: number;
};

/**
 * Derives pie layout values shared by VictoryChartPie rendering and tooltip hit-testing.
 */
function getVictoryPieLayout(pieNode: TNode | undefined, chartWidth: number, chartHeight: number): VictoryPieLayout {
    const radius = pieNode?.attributes.radius !== undefined ? Number(parseAttribute(pieNode.attributes.radius)) : undefined;
    const innerRadius = pieNode?.attributes.innerradius !== undefined ? Number(parseAttribute(pieNode.attributes.innerradius)) : 0;
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;

    return {
        radius,
        innerRadius,
        size: radius ? radius * 2 : undefined,
        hitTestRadius: radius ?? Math.min(chartWidth, chartHeight) / 2,
        centerX,
        centerY,
    };
}

export default getVictoryPieLayout;
