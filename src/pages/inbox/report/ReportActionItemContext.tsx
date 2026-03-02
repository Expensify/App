import {createContext} from 'react';

type ReportActionItemContextType = {
    shouldOpenReportInRHP: boolean;
    onPreviewPressed?: (reportID: string) => void;
};

const ReportActionItemContext = createContext<ReportActionItemContextType>({shouldOpenReportInRHP: false});

export default ReportActionItemContext;
