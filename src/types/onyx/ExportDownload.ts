import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Possible states of an export download */
type ExportDownloadState = ValueOf<typeof CONST.EXPORT_DOWNLOAD.STATE>;

/** Possible types of an export download */
type ExportDownloadType = ValueOf<typeof CONST.EXPORT_DOWNLOAD.TYPE>;

/** Model of an export download entry */
type ExportDownload = {
    /** Current state of the export download */
    state: ExportDownloadState;

    /** Type of export (csv, pdf or receipts), used to show the correct failure message */
    exportType?: ExportDownloadType;

    /** URL to download the exported file when state is ready */
    downloadURL?: string;

    /** Name of the exported file, used to build the secure download URL when state is ready (CSV exports) */
    fileName?: string;

    /** Number of reports included in the export (PDF exports only) */
    reportCount?: number;

    /** Number of reports that failed to export (PDF exports only) */
    failedReportCount?: number;

    /** Number of receipts included in the export (receipts exports only) */
    receiptCount?: number;

    /** Number of receipts that failed to export (receipts exports only) */
    failedReceiptCount?: number;

    /** Whether the export file should be sent from Concierge */
    shouldSendFromConcierge?: boolean;
};

export default ExportDownload;
