import type {RefObject} from 'react';
import type {View} from 'react-native';

type InsightsCaptureRef = RefObject<View | HTMLElement | null>;

type ExportInsightsDashboard = (params: {
    headerRef: InsightsCaptureRef;
    controlsRef: InsightsCaptureRef;
    contentRef: InsightsCaptureRef;
    backgroundColor: string;
    fileName: string;
}) => Promise<void>;

// Matches the page's section spacing and bottom padding (pb5), including after scrolling.
const INSIGHTS_EXPORT_PADDING = 20;
const INSIGHTS_EXPORT_SCALE = 2;

export {INSIGHTS_EXPORT_PADDING, INSIGHTS_EXPORT_SCALE};
export type {InsightsCaptureRef};
export default ExportInsightsDashboard;
