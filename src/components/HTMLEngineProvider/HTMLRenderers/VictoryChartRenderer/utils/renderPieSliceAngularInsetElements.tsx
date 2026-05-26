import {PaintStyle, Path, Skia} from '@shopify/react-native-skia';
import React from 'react';
import type {PieChartConfig, PolarChartDatum} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computePieSliceGeometries from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computePieSliceGeometries';
import {getAngularInsetStrokeWidth} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getPieChartPadAngleLayout';

const RADIAN = Math.PI / 180;

type RenderPieSliceAngularInsetElementsParams = {
    polarData: PolarChartDatum[];
    pieConfig: PieChartConfig;
    canvasWidth: number;
    canvasHeight: number;
};

function translateInnerRadius(innerRadius: number, radius: number): number {
    return innerRadius >= radius ? 0 : innerRadius;
}

function pointOnCircumference(center: {x: number; y: number}, circumferenceRadius: number, angleRadians: number) {
    return {
        x: center.x + circumferenceRadius * Math.cos(angleRadians),
        y: center.y + circumferenceRadius * Math.sin(angleRadians),
    };
}

function createAngularInsetPath(center: {x: number; y: number}, radius: number, innerRadius: number, startAngle: number, endAngle: number) {
    const path = Skia.Path.Make();
    const startRadians = startAngle * RADIAN;
    const endRadians = endAngle * RADIAN;

    if (innerRadius > 0) {
        const startInner = pointOnCircumference(center, innerRadius, startRadians);
        const startOuter = pointOnCircumference(center, radius, startRadians);
        const endInner = pointOnCircumference(center, innerRadius, endRadians);
        const endOuter = pointOnCircumference(center, radius, endRadians);

        path.moveTo(startInner.x, startInner.y);
        path.lineTo(startOuter.x, startOuter.y);
        path.moveTo(endInner.x, endInner.y);
        path.lineTo(endOuter.x, endOuter.y);
    } else {
        const startPoint = pointOnCircumference(center, radius, startRadians);
        const endPoint = pointOnCircumference(center, radius, endRadians);

        path.moveTo(center.x, center.y);
        path.lineTo(startPoint.x, startPoint.y);
        path.moveTo(center.x, center.y);
        path.lineTo(endPoint.x, endPoint.y);
    }

    return path;
}

/**
 * Renders pad-angle separators in the label overlay canvas.
 */
function renderPieSliceAngularInsetElements({polarData, pieConfig, canvasWidth, canvasHeight}: RenderPieSliceAngularInsetElementsParams): React.ReactElement[] {
    if (pieConfig.padAngle <= 0) {
        return [];
    }

    const slices = computePieSliceGeometries(polarData, pieConfig, canvasWidth, canvasHeight);
    const padColor = pieConfig.strokeColor ?? '#FFFFFF';
    const strokeWidth = getAngularInsetStrokeWidth(pieConfig.padAngle, slices.at(0)?.radius ?? 0);
    const insetPaint = Skia.Paint();
    insetPaint.setColor(Skia.Color(padColor));
    insetPaint.setStyle(PaintStyle.Stroke);
    insetPaint.setStrokeWidth(strokeWidth);

    return slices.flatMap((slice, index) => {
        const innerRadius = translateInnerRadius(pieConfig.innerRadius, slice.radius);
        const insetPath = createAngularInsetPath(slice.center, slice.radius, innerRadius, slice.startAngle, slice.endAngle);

        return [
            <Path
                key={`pie-slice-inset-${index}`}
                path={insetPath}
                paint={insetPaint}
            />,
        ];
    });
}

export default renderPieSliceAngularInsetElements;
