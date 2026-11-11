/** Fits the full filter row within the export margins, regardless of horizontal scrolling. Dimensions use output pixels. */
import {INSIGHTS_EXPORT_PADDING, INSIGHTS_EXPORT_SCALE} from './types';

type ControlsBounds = {
    x: number;
    width: number;
    height: number;
};

function getInsightsExportControlsLayout({x, width, height}: ControlsBounds, pageWidth: number) {
    const padding = INSIGHTS_EXPORT_PADDING * INSIGHTS_EXPORT_SCALE;
    const fittedWidth = Math.min(width, pageWidth - padding * 2);
    return {
        x: Math.max(padding, Math.min(x, pageWidth - padding - fittedWidth)),
        width: fittedWidth,
        height: Math.ceil(height * (fittedWidth / width)),
    };
}

export default getInsightsExportControlsLayout;
