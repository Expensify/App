import type {TextSelection} from '@components/Composer/types';

import useTransactionThreadReportID from '@hooks/useTransactionThreadReportID';

import createValueStore from '@libs/createValueStore';
import type {ValueStore} from '@libs/createValueStore';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {Dispatch, SetStateAction} from 'react';
import type {ValueOf} from 'type-fest';

import React, {createContext, useContext, useLayoutEffect, useState, useSyncExternalStore} from 'react';

import useActiveDraftReportAction from './useActiveDraftReportAction';

function noop() {
    return null;
}

/** Whether the report is currently being edited, is already submitted or is not editing any m */
type ReportActionEditMessageState = ValueOf<typeof CONST.REPORT_ACTION_EDIT_MESSAGE_STATE>;

type ReportActionActiveEdit = {
    editingReportID: string | null;
    editingReportActionID: string | null;
    editingReportAction: OnyxTypes.ReportAction | null;
    editingMessage: string | null;
};

type ReportActionEditMessageContextValue = ReportActionActiveEdit & {
    currentEditMessageSelection: TextSelection | null;
    editingState: ReportActionEditMessageState;
};

type ReportActionEditMessageContextActions = {
    setEditingMessage: Dispatch<SetStateAction<string | null>>;
    setCurrentEditMessageSelection: Dispatch<SetStateAction<TextSelection | null>>;
    submitEdit: () => void;
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

/**
 * The report action currently being edited, if any.
 *
 * Deliberately its own context holding a bare ID rather than being read off the edit-state value above: that value is a
 * fresh object on every keystroke and selection change, so a list subscribing to it would rebuild its props for the
 * whole history while the user types. A primitive value only notifies consumers when the edited action itself changes.
 */
const ReportActionEditingReportActionIDContext = createContext<string | null>(null);

/**
 * The action being edited while its draft text exists. A store instead of a context value: a new value would re-render
 * every row when editing starts or stops, while a row subscribed to the store re-renders only when its own answer changes.
 */
const DraftReportActionIDStoreContext = createContext<ValueStore<string | null>>(createValueStore<string | null>(null));

const ReportActionEditMessageActionsContext = createContext<ReportActionEditMessageContextActions>({
    setEditingMessage: noop,
    setCurrentEditMessageSelection: noop,
    submitEdit: noop,
    stopEditing: noop,
});

type ReportActionEditMessageContextProviderProps = {
    reportID: string | undefined;
    /**
     * When set, drafts for edits that render on money-request views but persist under the
     * one-transaction thread report are wired into this provider. Omit on non-money-request
     * screens, or supply the effective ID from `useTransactionThreadReportID` /
     * `ReportScreenEditMessageProviderWithTransactionThread`.
     */
    effectiveTransactionThreadReportID?: string;
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

    const [draftReportActionIDStore] = useState(() => createValueStore<string | null>(null));
    const draftReportActionID = editingMessage === null ? null : editingReportActionID;
    // Runs before paint, so the edited row shows its editor in the same frame as the rest of the edit state.
    useLayoutEffect(() => {
        draftReportActionIDStore.set(draftReportActionID);
    }, [draftReportActionIDStore, draftReportActionID]);

    return (
        <ReportActionEditMessageContext.Provider value={reportActionEditMessageContextValue}>
            <ReportActionEditMessageActionsContext.Provider value={actions}>
                <ReportActionEditingReportActionIDContext.Provider value={editingReportActionID}>
                    <DraftReportActionIDStoreContext.Provider value={draftReportActionIDStore}>{children}</DraftReportActionIDStoreContext.Provider>
                </ReportActionEditingReportActionIDContext.Provider>
            </ReportActionEditMessageActionsContext.Provider>
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

/** Subscribes to which action is being edited only, so the subscribing list is left alone while the user types in the editor. */
function useEditingReportActionID() {
    return useContext(ReportActionEditingReportActionIDContext);
}

/** Whether this action is being edited with draft text. Only the rows whose answer changes re-render when editing starts or stops. */
function useHasReportActionDraft(reportActionID: string) {
    const draftReportActionIDStore = useContext(DraftReportActionIDStoreContext);
    return useSyncExternalStore(draftReportActionIDStore.subscribe, () => draftReportActionIDStore.get() === reportActionID);
}

export {
    ReportActionEditMessageContextProvider,
    ReportScreenEditMessageProviderWithTransactionThread,
    useReportActionActiveEdit,
    useReportActionActiveEditActions,
    useEditingReportActionID,
    useHasReportActionDraft,
};
export type {ReportActionEditMessageState};
