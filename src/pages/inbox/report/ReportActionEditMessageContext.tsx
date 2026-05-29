import React, {createContext, useContext, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {ValueOf} from 'type-fest';
import type {TextSelection} from '@components/Composer/types';
import useTransactionThreadReportID from '@hooks/useTransactionThreadReportID';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import useActiveDraftReportAction from './useActiveDraftReportAction';

function noop() {
    return null;
}

/** Whether the report is currently being edited, is already submitted or is not editing any m */
type ReportActionEditMessageState = ValueOf<typeof CONST.REPORT_ACTION_EDIT_MESSAGE_STATE>;

type ReportActionActiveEdit = {
    /** The report ID */
    editingReportID: string | null;
    /** The report action ID */
    editingReportActionID: string | null;
    /** The report action */
    editingReportAction: OnyxTypes.ReportAction | null;
    /** The editing message */
    editingMessage: string | null;
};

type ReportActionEditMessageContextValue = ReportActionActiveEdit & {
    /** The current edit message selection */
    currentEditMessageSelection: TextSelection | null;
    /** The editing state */
    editingState: ReportActionEditMessageState;
};

type ReportActionEditMessageContextActions = {
    /** Set the editing message */
    setEditingMessage: Dispatch<SetStateAction<string | null>>;
    /** Set the current edit message selection */
    setCurrentEditMessageSelection: Dispatch<SetStateAction<TextSelection | null>>;
    /** Submit the edit */
    submitEdit: () => void;
    /** Stop the editing */
    stopEditing: () => void;
};

const ReportActionEditMessageContext = createContext<ReportActionEditMessageContextValue>({
    editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF,
    editingReportID: null,
    editingReportActionID: null,
    editingReportAction: null,
    editingMessage: null,
    currentEditMessageSelection: null,
});

const ReportActionEditMessageActionsContext = createContext<ReportActionEditMessageContextActions>({
    setEditingMessage: noop,
    setCurrentEditMessageSelection: noop,
    submitEdit: noop,
    stopEditing: noop,
});

type ReportActionEditMessageContextProviderProps = {
    /** The report ID */
    reportID: string | undefined;
    /**
     * When set, drafts for edits that render on money-request views but persist under the
     * one-transaction thread report are wired into this provider. Omit on non-money-request
     * screens, or supply the effective ID from `useTransactionThreadReportID` /
     * `ReportScreenEditMessageProviderWithTransactionThread`.
     */
    effectiveTransactionThreadReportID?: string;
    /** The children */
    children: React.ReactNode;
};

function ReportActionEditMessageContextProvider({reportID, effectiveTransactionThreadReportID, children}: ReportActionEditMessageContextProviderProps) {
    const activeDraftEditResolution = useActiveDraftReportAction({effectiveTransactionThreadReportID, reportID});

    const [editingState, setEditingState] = useState<ReportActionEditMessageState>(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
    const [prevEditingReportActionID, setPrevEditingReportActionID] = useState<string | null>(null);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [currentEditMessageSelection, setCurrentEditMessageSelectionState] = useState<TextSelection | null>(null);

    let editingReportID: string | null = null;
    let editingReportActionID: string | null = null;
    let editingReportAction: OnyxTypes.ReportAction | null = null;

    const syncComposerDraftFromPersistedOnyxDraft = (activePersistedDraftReportActionID: string, persistedDraftMessagePreview: string | null) => {
        if (persistedDraftMessagePreview == null) {
            return;
        }

        const didFocusShiftToDistinctReportAction = prevEditingReportActionID !== activePersistedDraftReportActionID;
        if (!didFocusShiftToDistinctReportAction) {
            return;
        }

        setEditingMessage(persistedDraftMessagePreview);
        setPrevEditingReportActionID(activePersistedDraftReportActionID);
        const defaultSelection: TextSelection = {
            start: persistedDraftMessagePreview.length,
            end: persistedDraftMessagePreview.length,
        };
        setCurrentEditMessageSelectionState(defaultSelection);
    };

    // Bridge resolved Onyx drafts into composing state (`useActiveDraftReportAction` encapsulates ancestry / visible / transaction-thread precedence).
    if (activeDraftEditResolution !== null) {
        editingReportID = activeDraftEditResolution.editingReportID;
        editingReportActionID = activeDraftEditResolution.editingReportActionID;
        editingReportAction = activeDraftEditResolution.editingReportAction;

        if (editingState === CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF) {
            setEditingState(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);
        }

        syncComposerDraftFromPersistedOnyxDraft(activeDraftEditResolution.editingReportActionID, activeDraftEditResolution.draftMessage);
    }

    const submitEdit = () => {
        setEditingState(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.SUBMITTED);
    };

    const stopEditing = () => {
        setEditingState(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
        setEditingMessage(null);
        setPrevEditingReportActionID(null);
        setCurrentEditMessageSelectionState(null);
    };

    if (editingReportID == null && editingState !== CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF) {
        stopEditing();
    }

    const setCurrentEditMessageSelection = (setSelectionStateAction: SetStateAction<TextSelection | null>) => {
        if (editingState !== CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING) {
            return;
        }

        setCurrentEditMessageSelectionState(setSelectionStateAction);
    };

    const reportActionEditMessageContextValue: ReportActionEditMessageContextValue = {
        editingState,
        editingReportID,
        editingReportActionID,
        editingReportAction,
        editingMessage,
        currentEditMessageSelection,
    };

    const actions: ReportActionEditMessageContextActions = {
        setEditingMessage,
        setCurrentEditMessageSelection,
        submitEdit,
        stopEditing,
    };

    return (
        <ReportActionEditMessageContext.Provider value={reportActionEditMessageContextValue}>
            <ReportActionEditMessageActionsContext.Provider value={actions}>{children}</ReportActionEditMessageActionsContext.Provider>
        </ReportActionEditMessageContext.Provider>
    );
}

type ReportScreenEditMessageProviderWithTransactionThreadProps = {
    reportID: string | undefined;
    children: React.ReactNode;
};

/** Wires `effectiveTransactionThreadReportID` from `useTransactionThreadReportID` for money-request report views. */
function ReportScreenEditMessageProviderWithTransactionThread({reportID, children}: ReportScreenEditMessageProviderWithTransactionThreadProps) {
    const {effectiveTransactionThreadReportID} = useTransactionThreadReportID(reportID);
    return (
        <ReportActionEditMessageContextProvider
            effectiveTransactionThreadReportID={effectiveTransactionThreadReportID}
            reportID={reportID}
        >
            {children}
        </ReportActionEditMessageContextProvider>
    );
}

function useReportActionActiveEdit() {
    return useContext(ReportActionEditMessageContext);
}

function useReportActionActiveEditActions() {
    return useContext(ReportActionEditMessageActionsContext);
}

export {
    ReportActionEditMessageContextProvider,
    ReportScreenEditMessageProviderWithTransactionThread,
    useReportActionActiveEdit,
    useReportActionActiveEditActions,
    ReportActionEditMessageContext,
};
export type {ReportActionActiveEdit, ReportActionEditMessageContextValue, ReportActionEditMessageState};
