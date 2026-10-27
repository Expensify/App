import type {RefObject} from 'react';
import type {View} from 'react-native';

type InsightsCaptureRef = RefObject<View | HTMLElement | null>;

type ExportInsightsDashboard = (params: {controlsRef: InsightsCaptureRef; contentRef: InsightsCaptureRef; backgroundColor: string; fileName: string}) => Promise<void>;

// Matches the space below the page filter row (pb5), including when the dashboard has been scrolled.
const INSIGHTS_EXPORT_FILTER_GAP = 20;
const INSIGHTS_EXPORT_SCALE = 2;

export {INSIGHTS_EXPORT_FILTER_GAP, INSIGHTS_EXPORT_SCALE};
export type {InsightsCaptureRef};
export default ExportInsightsDashboard;
