import type ReportFullyDrawn from './types';

// Time to full display is an Android startup metric, so the other platforms have nothing to report.
const reportFullyDrawn: ReportFullyDrawn = () => {};

export default reportFullyDrawn;
