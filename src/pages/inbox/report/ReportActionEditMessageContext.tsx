import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {TextSelection} from '@components/Composer/types';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

function NOOP() {
    return null;
}

type EditingState = 'editing' | 'submitted' | 'cancelled';

type ReportActionActiveEdit = {
    editingReportID: string | null;
    editingReportActionID: string | null;
    editingReportAction: OnyxTypes.ReportAction | null;
    editingMessage: string | null;
};

type ReportActionEditMessageContextValue = ReportActionActiveEdit & {
    setEditingMessage: Dispatch<SetStateAction<string | null>>;
    currentEditMessageSelection: TextSelection | null;
    setCurrentEditMessageSelection: Dispatch<SetStateAction<TextSelection | null>>;
    getEditingState: () => EditingState | null;
    setEditingState: (state: EditingState | null) => void;
};

const ReportActionEditMessageContext = createContext<ReportActionEditMessageContextValue>({
    editingReportID: null,
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
    parentReportID: string | undefined;
    parentReportAction: OnyxTypes.ReportAction | undefined;
    children: React.ReactNode;
};

function ReportActionEditMessageContextProvider({reportID, parentReportID, parentReportAction, children}: ReportActionEditMessageContextProviderProps) {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
    });
    const [reportActionDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);

    const [editingReportID, setEditingReportID] = useState<string | null>(null);
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
        const newEditingReportID = activeEdit?.editingReportID ?? null;

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
        if (newEditingReportID !== editingReportID) {
            setEditingReportID(newEditingReportID);
        }

        if (newEditingReportActionID !== editingReportActionID) {
            setEditingReportActionID(newEditingReportActionID);
        }
        if (newEditingReportAction !== editingReportAction) {
            setEditingReportAction(newEditingReportAction);
        }
        if (newEditingMessage !== editingMessage) {
            setEditingMessage(newEditingMessage);
        }
    };

    const setCurrentEditMessageSelection = (setSelectionStateAction: SetStateAction<TextSelection | null>) => {
        if (!editingReportActionID) {
            return;
        }

        setCurrentEditMessageSelectionState(setSelectionStateAction);
    };

    const reset = () => {
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

        let parentReportActionDrafts: OnyxTypes.ReportActionsDrafts | undefined;
        if (parentReportAction && parentReportID) {
            parentReportActionDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${parentReportID}`];
        }

        if (!reportDrafts && !parentReportActionDrafts) {
            reset();
            return;
        }

        let editReportID: string | undefined;
        let reportActionID: string | undefined;
        let reportAction: OnyxTypes.ReportAction | undefined;
        let draft: OnyxTypes.ReportActionsDraft | undefined;

        if (parentReportAction && parentReportActionDrafts) {
            const parentReportActionDraft = parentReportActionDrafts[parentReportAction.reportActionID];
            if (parentReportActionDraft) {
                editReportID = parentReportID;
                reportActionID = parentReportAction.reportActionID;
                reportAction = parentReportAction;
                draft = parentReportActionDraft;
            }
        }

        if (!reportActionID) {
            const reportDraftEntry = reportDrafts ? Object.entries(reportDrafts).find(([, d]) => d?.message !== undefined) : undefined;

            if (!reportDraftEntry) {
                reset();
                return;
            }

            const [reportActionIDOfDraft, reportActionDraft] = reportDraftEntry;

            editReportID = reportID;
            reportActionID = reportActionIDOfDraft;
            reportAction = reportActions?.[reportActionID];
            draft = reportActionDraft;
        }

        if (editingStateRef.current !== null) {
            return;
        }

        editingStateRef.current = 'editing';
        updateActiveEditState({
            editingReportID: editReportID ?? null,
            editingReportActionID: reportActionID,
            editingReportAction: reportAction ?? null,
            editingMessage: draft?.message ?? null,
        });
    }, [parentReportAction, parentReportID, reportActionDrafts, reportActions, reportID, reset, updateActiveEditState]);

    return (
        <ReportActionEditMessageContext.Provider
            // eslint-disable-next-line react/jsx-no-constructed-context-values
            value={{
                editingReportID,
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
