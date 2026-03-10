import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import type {TextSelection} from '@components/Composer/types';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

function NOOP() {
    return null;
}

type EditingState = 'editing' | 'submitted' | 'cancelled';

type ReportActionActiveEdit = {
    editingReportActionID: string | null;
    editingReportAction: OnyxTypes.ReportAction | null;
    editingMessage: string | null;
};

type ReportActionEditMessageContextValue = ReportActionActiveEdit & {
    setEditingMessage: (message: string | null) => void;
    currentEditMessageSelection: TextSelection | null;
    setCurrentEditMessageSelection: (selection: TextSelection) => void;
    getEditingState: () => EditingState | null;
    setEditingState: (state: EditingState | null) => void;
};

const ReportActionEditMessageContext = createContext<ReportActionEditMessageContextValue>({
    editingReportActionID: null,
    editingReportAction: null,
    editingMessage: null,
    setEditingMessage: NOOP,
    currentEditMessageSelection: null,
    setCurrentEditMessageSelection: NOOP,
    getEditingState: NOOP,
    setEditingState: NOOP,
});

type ReportActionEditMessageContextProviderProps = {
    reportID: string | undefined;
    children: React.ReactNode;
};

function ReportActionEditMessageContextProvider({reportID, children}: ReportActionEditMessageContextProviderProps) {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
    });
    const [reportActionDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);

    const [editingReportActionID, setEditingReportActionID] = useState<string | null>(null);
    const [editingReportAction, setEditingReportAction] = useState<OnyxTypes.ReportAction | null>(null);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [currentEditMessageSelection, setCurrentEditMessageSelectionState] = useState<TextSelection | null>(null);
    const editingStateRef = useRef<EditingState | null>(null);
    const getEditingState = () => {
        return editingStateRef.current;
    };
    const setEditingState = (state: EditingState | null) => {
        editingStateRef.current = state;
    };

    const updateActiveEditState = useCallback(
        (activeEdit: ReportActionActiveEdit | null) => {
            const newEditingReportActionID = activeEdit?.editingReportActionID ?? null;
            const newEditingReportAction = activeEdit?.editingReportAction ?? null;
            const newEditingMessage = activeEdit?.editingMessage ?? null;

            if (newEditingReportActionID !== editingReportActionID) {
                setEditingReportActionID(newEditingReportActionID);
            }
            if (newEditingReportAction !== editingReportAction) {
                setEditingReportAction(newEditingReportAction);
            }
            if (newEditingMessage !== editingMessage) {
                setEditingMessage(newEditingMessage);
            }
        },
        [editingReportActionID, editingReportAction, editingMessage],
    );

    const setCurrentEditMessageSelection = useCallback(
        (selection: TextSelection | null) => {
            if (!editingReportActionID) {
                return;
            }

            setCurrentEditMessageSelectionState(selection);
        },
        [editingReportActionID],
    );

    const reset = useCallback(() => {
        if (editingStateRef.current === 'editing') {
            return;
        }

        editingStateRef.current = null;
        updateActiveEditState(null);
        setCurrentEditMessageSelection(null);
    }, [updateActiveEditState, setCurrentEditMessageSelection]);

    // Initially set the editing report action state when the draft comments change
    useEffect(() => {
        const reportDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`];

        if (!reportDrafts) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            reset();
            return;
        }

        const reportDraftEntry = Object.entries(reportDrafts).find(([, draft]) => draft?.message !== undefined);

        if (!reportDraftEntry) {
            reset();
            return;
        }

        const [reportActionID, draft] = reportDraftEntry;

        if (editingStateRef.current !== null) {
            return;
        }

        editingStateRef.current = 'editing';
        updateActiveEditState({
            editingReportActionID: reportActionID,
            editingReportAction: reportActions?.[reportActionID] ?? null,
            editingMessage: draft.message,
        });
    }, [reportActionDrafts, reportActions, reportID, reset, updateActiveEditState]);

    return (
        <ReportActionEditMessageContext.Provider
            // eslint-disable-next-line react/jsx-no-constructed-context-values
            value={{
                editingReportActionID,
                editingReportAction,
                editingMessage,
                setEditingMessage,
                currentEditMessageSelection,
                setCurrentEditMessageSelection,
                getEditingState,
                setEditingState,
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
