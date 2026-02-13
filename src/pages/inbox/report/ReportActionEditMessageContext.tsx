import {createContext, useContext, useEffect, useState} from 'react';
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
    setActiveEdit: (activeEdit: ReportActionActiveEdit | null) => void;

    currentEditMessageSelection: TextSelection | null;
    setCurrentEditMessageSelection: (selection: TextSelection) => void;
};

const ReportActionEditMessageContext = createContext<ReportActionEditMessageContextValue>({
    editingReportActionID: null,
    editingReportAction: null,
    editingMessage: null,
    setActiveEdit: NOOP,

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
    const [currentEditMessageSelection, setCurrentEditMessageSelection] = useState<TextSelection | null>(null);

    function setActiveEdit(activeEdit: ReportActionActiveEdit | null) {
        setEditingReportActionID(activeEdit?.editingReportActionID ?? null);
        setEditingReportAction(activeEdit?.editingReportAction ?? null);
        setEditingMessage(activeEdit?.editingMessage ?? null);
    }

    // Set the active edit when the report actions or draft comments change
    useEffect(() => {
        if (editingReportActionID) {
            return;
        }

        const reportDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`];

        if (!reportDrafts) {
            setActiveEdit(null);
            return;
        }

        const reportDraftEntry = Object.entries(reportDrafts).find(([, draft]) => draft?.message);

        if (!reportDraftEntry) {
            setActiveEdit(null);
            return;
        }

        const [reportActionID, draft] = reportDraftEntry;

        setActiveEdit({
            editingReportActionID: reportActionID,
            editingReportAction: reportActions?.[reportActionID] ?? null,
            editingMessage: draft.message,
        });
    }, [editingReportActionID, reportActionDrafts, reportActions, reportID]);

    return (
        <ReportActionEditMessageContext.Provider
            // eslint-disable-next-line react/jsx-no-constructed-context-values
            value={{
                editingReportActionID,
                editingReportAction,
                editingMessage,
                setActiveEdit,
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
