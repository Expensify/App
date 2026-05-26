import type {PieChartConfig, PolarChartDatum} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import {getPieChartPadAngleLayout} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getPieChartPadAngleLayout';

type PieSliceGeometry = {
    label: string;
    center: {x: number; y: number};
    radius: number;
    startAngle: number;
    endAngle: number;
};

/**
 * Computes pie slice geometry to match victory-native's PieChart layout, including `padAngle`.
 */
function computePieSliceGeometries(polarData: PolarChartDatum[], pieConfig: PieChartConfig, canvasWidth: number, canvasHeight: number): PieSliceGeometry[] {
    if (polarData.length === 0 || canvasWidth <= 0 || canvasHeight <= 0) {
        return [];
    }

    const pieSize = pieConfig.radius ? pieConfig.radius * 2 : Math.min(canvasWidth, canvasHeight);
    const radius = pieSize / 2;
    const center = {x: canvasWidth / 2, y: canvasHeight / 2};
    const totalValue = polarData.reduce((sum, datum) => sum + datum.y, 0);

    if (totalValue <= 0) {
        return [];
    }

    const {circleSweepDegrees, startAngle} = getPieChartPadAngleLayout(pieConfig.padAngle, polarData.length);
    let currentAngle = startAngle;

    return polarData.map((datum) => {
        const sweepAngle = (datum.y / totalValue) * circleSweepDegrees;
        const sliceStartAngle = currentAngle;
        const sliceEndAngle = currentAngle + sweepAngle;
        currentAngle = sliceEndAngle;

        return {
            label: datum.label,
            center,
            radius,
            startAngle: sliceStartAngle,
            endAngle: sliceEndAngle,
        };
    });
}

export type {PieSliceGeometry};
export default computePieSliceGeometries;
