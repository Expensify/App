import {createContext} from 'react';

type ReportActionItemContextType = {
    shouldOpenReportInRHP: boolean;
};

const ReportActionItemContext = createContext<ReportActionItemContextType>({shouldOpenReportInRHP: false});

export {ReportActionItemContext};
