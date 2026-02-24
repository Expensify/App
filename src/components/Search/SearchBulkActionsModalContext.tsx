import React, {createContext, useContext} from 'react';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type RejectModalActionType = ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD> | ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT>;

export type SearchBulkActionsModalContextValue = {
    setIsOfflineModalVisible: (visible: boolean) => void;
    setRejectModalAction: (action: RejectModalActionType | null) => void;
    setIsHoldEducationalModalVisible: (visible: boolean) => void;
    setIsDownloadErrorModalVisible: (visible: boolean) => void;
    setEmptyReportsCount: (count: number) => void;
};

const defaultValue: SearchBulkActionsModalContextValue = {
    setIsOfflineModalVisible: () => {},
    setRejectModalAction: () => {},
    setIsHoldEducationalModalVisible: () => {},
    setIsDownloadErrorModalVisible: () => {},
    setEmptyReportsCount: () => {},
};

const SearchBulkActionsModalContext = createContext<SearchBulkActionsModalContextValue>(defaultValue);

function useSearchBulkActionsModal() {
    return useContext(SearchBulkActionsModalContext);
}

export {SearchBulkActionsModalContext, useSearchBulkActionsModal};
