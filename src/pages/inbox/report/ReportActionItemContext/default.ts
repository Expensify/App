import type {ReportActionItemActionsContextType, ReportActionItemStateContextType} from './types';

const defaultReportActionItemStateContextValue: ReportActionItemStateContextType = {
    shouldOpenReportInRHP: false,
};

const defaultReportActionItemActionsContextValue: ReportActionItemActionsContextType = {
    onPreviewPressed: undefined,
};

export {defaultReportActionItemStateContextValue, defaultReportActionItemActionsContextValue};
