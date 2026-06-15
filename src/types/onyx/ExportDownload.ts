import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Possible states of an export download */
type ExportDownloadState = ValueOf<typeof CONST.EXPORT_DOWNLOAD.STATE>;

/** Model of an export download entry */
type ExportDownload = {
    /** Current state of the export download */
    state: ExportDownloadState;

    /** URL to download the exported file when state is ready */
    downloadURL?: string;

    /** Name of the exported file, used to build the secure download URL when state is ready */
    fileName?: string;

    /** Number of reports included in the export (PDF exports only) */
    reportCount?: number;

    /** Number of reports that failed to export (PDF exports only) */
    failedReportCount?: number;

    /** Whether the export file should be sent from Concierge */
    shouldSendFromConcierge?: boolean;
};

export default ExportDownload;
