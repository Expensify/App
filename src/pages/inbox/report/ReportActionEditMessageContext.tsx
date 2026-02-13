import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import type {TextSelection} from '@components/Composer/types';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

const NOOP = () => {};

type ReportActionActiveEdit = {
    editingReportActionID: string | null;
    editingReportAction: OnyxTypes.ReportAction | null;
    editingMessage: string | null;
};

type ReportActionEditMessageContextValue = ReportActionActiveEdit & {
    currentEditMessageSelection: TextSelection | null;
    setCurrentEditMessageSelection: (selection: TextSelection) => void;
};

const ReportActionEditMessageContext = createContext<ReportActionEditMessageContextValue>({
    editingReportActionID: null,
    editingReportAction: null,
    editingMessage: null,
    currentEditMessageSelection: null,
    setCurrentEditMessageSelection: NOOP,
});

type ReportActionEditMessageContextProviderProps = {
    reportID: string | undefined;
    children: React.ReactNode;
};

function ReportActionEditMessageContextProvider({reportID, children}: ReportActionEditMessageContextProviderProps) {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID ?? ''}`, {
        canEvict: false,
        canBeMissing: true,
    });
    const [reportActionDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS, {canBeMissing: true});

    const [editingReportActionID, setEditingReportActionID] = useState<string | null>(null);
    const [editingReportAction, setEditingReportAction] = useState<OnyxTypes.ReportAction | null>(null);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [currentEditMessageSelection, setCurrentEditMessageSelectionState] = useState<TextSelection | null>(null);

    function setActiveEdit(activeEdit: ReportActionActiveEdit | null) {
        setEditingReportActionID(activeEdit?.editingReportActionID ?? null);
        setEditingReportAction(activeEdit?.editingReportAction ?? null);
        setEditingMessage(activeEdit?.editingMessage ?? null);
    }

    const setCurrentEditMessageSelection = useCallback(
        (selection: TextSelection | null) => {
            if (!editingReportActionID) {
                return;
            }

            setCurrentEditMessageSelectionState(selection);
        },
        [editingReportActionID],
    );

    // Set the active edit when the report actions or draft comments change
    useEffect(() => {
        const reportDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`];

        if (!reportDrafts) {
            setActiveEdit(null);
            setCurrentEditMessageSelection(null);
            return;
        }

        const reportDraftEntry = Object.entries(reportDrafts).find(([, draft]) => draft?.message);

        if (!reportDraftEntry) {
            setActiveEdit(null);
            setCurrentEditMessageSelection(null);
            return;
        }

        const [reportActionID, draft] = reportDraftEntry;

        setActiveEdit({
            editingReportActionID: reportActionID,
            editingReportAction: reportActions?.[reportActionID] ?? null,
            editingMessage: draft.message,
        });
    }, [editingReportActionID, reportActionDrafts, reportActions, reportID, setCurrentEditMessageSelection]);

    return (
        <ReportActionEditMessageContext.Provider
            // eslint-disable-next-line react/jsx-no-constructed-context-values
            value={{
                editingReportActionID,
                editingReportAction,
                editingMessage,
                currentEditMessageSelection,
                setCurrentEditMessageSelection,
            }}
        >
            {children}
        </ReportActionEditMessageContext.Provider>
    );
}

function useReportActionActiveEdit() {
    return useContext(ReportActionEditMessageContext);
}

export {ReportActionEditMessageContextProvider, useReportActionActiveEdit, ReportActionEditMessageContext};
export type {ReportActionActiveEdit, ReportActionEditMessageContextValue};
