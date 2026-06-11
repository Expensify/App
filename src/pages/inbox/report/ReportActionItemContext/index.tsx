import {createContext, useContext} from 'react';
import defaultReportActionItemActionsContextValue from './default';
import type ReportActionItemActionsContextType from './types';

const ReportActionItemActionsContext = createContext<ReportActionItemActionsContextType>(defaultReportActionItemActionsContextValue);

function useReportActionItemActions(): ReportActionItemActionsContextType {
    return useContext(ReportActionItemActionsContext);
}

export {ReportActionItemActionsContext, useReportActionItemActions};
