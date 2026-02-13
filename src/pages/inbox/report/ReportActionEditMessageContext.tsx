import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
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
    didSubmitEditRef: React.RefObject<boolean | null>;
};

const ReportActionEditMessageContext = createContext<ReportActionEditMessageContextValue>({
    editingReportActionID: null,
    editingReportAction: null,
    editingMessage: null,
    currentEditMessageSelection: null,
    setCurrentEditMessageSelection: NOOP,
    didSubmitEditRef: {current: null},
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
    const didSubmitEditRef = useRef<boolean | null>(null);

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
        if (didSubmitEditRef.current === false) {
            return;
        }

        didSubmitEditRef.current = null;
        updateActiveEditState(null);
        setCurrentEditMessageSelection(null);
    }, [updateActiveEditState, setCurrentEditMessageSelection]);

    // Set the active edit when the report actions or draft comments change
    useEffect(() => {
        const reportDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`];

        if (!reportDrafts) {
            reset();
            return;
        }

        const reportDraftEntry = Object.entries(reportDrafts).find(([, draft]) => draft?.message);

        if (!reportDraftEntry) {
            reset();
            return;
        }

        const [reportActionID, draft] = reportDraftEntry;

        didSubmitEditRef.current = false;
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
                currentEditMessageSelection,
                setCurrentEditMessageSelection,
                didSubmitEditRef,
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
