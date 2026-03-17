import {useIsFocused} from '@react-navigation/native';
import React, {createContext, useContext, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {TextSelection} from '@components/Composer/types';
import useAncestors from '@hooks/useAncestors';
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
    currentEditMessageSelection: TextSelection | null;
    editingState: EditingState | null;
};

type ReportActionEditMessageContextActions = {
    setEditingState: Dispatch<SetStateAction<EditingState | null>>;
    setEditingMessage: Dispatch<SetStateAction<string | null>>;
    setCurrentEditMessageSelection: Dispatch<SetStateAction<TextSelection | null>>;
};

const ReportActionEditMessageContext = createContext<ReportActionEditMessageContextValue>({
    editingReportID: null,
    editingReportActionID: null,
    editingReportAction: null,
    editingMessage: null,
    currentEditMessageSelection: null,
    editingState: null,
});

const ReportActionEditMessageActionsContext = createContext<ReportActionEditMessageContextActions>({
    setEditingState: NOOP,
    setEditingMessage: NOOP,
    setCurrentEditMessageSelection: NOOP,
});

type ReportActionEditMessageContextProviderProps = {
    reportID: string | undefined;
    parentReportID: string | undefined;
    parentReportAction: OnyxTypes.ReportAction | undefined;
    children: React.ReactNode;
};

function ReportActionEditMessageContextProvider({reportID, parentReportID, parentReportAction, children}: ReportActionEditMessageContextProviderProps) {
    const isFocused = useIsFocused();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
    });
    const [reportActionDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);
    const ancestors = useAncestors(report);

    const [editingState, setEditingState] = useState<EditingState | null>(null);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [currentEditMessageSelection, setCurrentEditMessageSelectionState] = useState<TextSelection | null>(null);

    const reportDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`];

    let parentReportDrafts: OnyxTypes.ReportActionsDrafts | undefined;
    if (parentReportAction && parentReportID) {
        parentReportDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${parentReportID}`];
    }

    let editingReportID: string | null = null;
    let editingReportActionID: string | null = null;
    let editingReportAction: OnyxTypes.ReportAction | null = null;

    if (isFocused) {
        const ancestorWithDraft = [...ancestors]
            .slice()
            .reverse()
            .find(({report: ancestorReport, reportAction}) => {
                const ancestorDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${ancestorReport.reportID}`];
                const ancestorDraft = ancestorDrafts?.[reportAction.reportActionID];

                return ancestorDraft?.message !== undefined;
            });

        if (ancestorWithDraft) {
            const {report: ancestorReport, reportAction: ancestorReportAction} = ancestorWithDraft;
            const ancestorDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${ancestorReport.reportID}`];
            const ancestorReportActionDraft = ancestorDrafts?.[ancestorReportAction.reportActionID];

            editingReportID = ancestorReport.reportID;
            editingReportActionID = ancestorReportAction.reportActionID;
            editingReportAction = ancestorReportAction;
            const nextMessage = ancestorReportActionDraft?.message ?? null;

            if (editingState === null) {
                setEditingState('editing');
            }
            if (editingMessage == null && editingMessage !== nextMessage) {
                setEditingMessage(nextMessage);
            }
        } else if (parentReportAction && parentReportDrafts?.[parentReportAction.reportActionID]) {
            const parentReportActionDraft = parentReportDrafts[parentReportAction.reportActionID];

            editingReportID = parentReportID ?? null;
            editingReportActionID = parentReportAction.reportActionID;
            editingReportAction = parentReportAction;
            const nextMessage = parentReportActionDraft?.message ?? null;

            if (editingState === null) {
                setEditingState('editing');
            }
            if (editingMessage == null && editingMessage !== nextMessage) {
                setEditingMessage(nextMessage);
            }
        } else if (reportDrafts) {
            const reportDraftEntry = Object.entries(reportDrafts).find(([, draft]) => draft?.message !== undefined);

            if (reportDraftEntry) {
                const [reportActionIDOfDraft, reportActionDraft] = reportDraftEntry;

                editingReportID = reportID ?? null;
                editingReportActionID = reportActionIDOfDraft;
                editingReportAction = reportActions?.[reportActionIDOfDraft] ?? null;
                const nextMessage = reportActionDraft?.message ?? null;

                if (editingState === null) {
                    setEditingState('editing');
                }
                if (editingMessage == null && editingMessage !== nextMessage) {
                    setEditingMessage(nextMessage);
                }
            }
        }
    }

    if (editingReportID == null && editingState !== null) {
        setEditingState(null);
        setEditingMessage(null);
    }

    const setCurrentEditMessageSelection = (setSelectionStateAction: SetStateAction<TextSelection | null>) => {
        if (editingState !== 'editing') {
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
        setEditingState,
        setEditingMessage,
        setCurrentEditMessageSelection,
    };

    return (
        <ReportActionEditMessageContext.Provider value={reportActionEditMessageContextValue}>
            <ReportActionEditMessageActionsContext.Provider value={actions}>{children}</ReportActionEditMessageActionsContext.Provider>
        </ReportActionEditMessageContext.Provider>
    );
}

function useReportActionActiveEdit() {
    return useContext(ReportActionEditMessageContext);
}

function useReportActionActiveEditActions() {
    return useContext(ReportActionEditMessageActionsContext);
}

export {ReportActionEditMessageContextProvider, useReportActionActiveEdit, useReportActionActiveEditActions, ReportActionEditMessageContext};
export type {ReportActionActiveEdit, ReportActionEditMessageContextValue};
