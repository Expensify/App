import {createContext, useContext} from 'react';
import {defaultReportActionItemActionsContextValue, defaultReportActionItemStateContextValue} from './default';
import type {ReportActionItemActionsContextType, ReportActionItemStateContextType} from './types';

const ReportActionItemStateContext = createContext<ReportActionItemStateContextType>(defaultReportActionItemStateContextValue);
const ReportActionItemActionsContext = createContext<ReportActionItemActionsContextType>(defaultReportActionItemActionsContextValue);

function useReportActionItemState(): ReportActionItemStateContextType {
    return useContext(ReportActionItemStateContext);
}

function useReportActionItemActions(): ReportActionItemActionsContextType {
    return useContext(ReportActionItemActionsContext);
}

export {ReportActionItemStateContext, ReportActionItemActionsContext, useReportActionItemState, useReportActionItemActions};
export type {ReportActionItemActionsContextType, ReportActionItemStateContextType} from './types';
