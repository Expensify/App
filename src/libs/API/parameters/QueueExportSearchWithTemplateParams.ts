import type ExportSearchWithTemplateParams from './ExportSearchWithTemplateParams';

type QueueExportSearchWithTemplateParams = ExportSearchWithTemplateParams & {
    /**
     * Identifier for the export download status flow (nvp_exportDownload_<id>). Only sent by callers that render
     * ExportDownloadStatusModal; when omitted, the backend keeps the legacy "Concierge will send" behavior.
     */
    exportID?: string;
};

export default QueueExportSearchWithTemplateParams;
