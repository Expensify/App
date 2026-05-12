import React, {createContext, useContext, useEffect, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {TextSelection} from '@components/Composer/types';
import useAncestors from '@hooks/useAncestors';
import useOnyx from '@hooks/useOnyx';
import {clearAllReportActionDrafts} from '@libs/actions/Report';
import {getOriginalReportID, shouldExcludeAncestorReportAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

function NOOP() {
    return null;
}

/** Whether the report is currently being edited, is already submitted or is not editing any m */
type EditingState = 'off' | 'editing' | 'submitted';

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
    editingState: EditingState;
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
    editingState: 'off',
    editingReportID: null,
    editingReportActionID: null,
    editingReportAction: null,
    editingMessage: null,
    currentEditMessageSelection: null,
});

const ReportActionEditMessageActionsContext = createContext<ReportActionEditMessageContextActions>({
    setEditingMessage: NOOP,
    setCurrentEditMessageSelection: NOOP,
    submitEdit: NOOP,
    stopEditing: NOOP,
});

type ReportActionEditMessageContextProviderProps = {
    /** The report ID */
    reportID: string | undefined;
    /** The children */
    children: React.ReactNode;
};

function ReportActionEditMessageContextProvider({reportID, children}: ReportActionEditMessageContextProviderProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);

    const ancestors = useAncestors(report, shouldExcludeAncestorReportAction);

    const ancestorReportActionsSelector = (allReportActions: OnyxCollection<OnyxTypes.ReportActions>) => {
        if (!allReportActions) {
            return {};
        }
        const result: OnyxCollection<OnyxTypes.ReportActions> = {};
        for (const ancestor of ancestors) {
            const key = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestor.report.reportID}`;
            result[key] = allReportActions[key];
        }
        return result;
    };

    const [ancestorsReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: ancestorReportActionsSelector}, [ancestors]);

    const ancestorDraftSelector = (allDrafts: OnyxCollection<OnyxTypes.ReportActionsDrafts>) => {
        if (!allDrafts) {
            return {};
        }
        const result: OnyxCollection<OnyxTypes.ReportActionsDrafts> = {};
        if (reportID) {
            const currentDraftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`;
            result[currentDraftKey] = allDrafts[currentDraftKey];
        }
        for (const ancestor of ancestors) {
            const reportActionsForAncestor = ancestorsReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestor.report.reportID}`];
            const origID = getOriginalReportID(ancestor.report.reportID, ancestor.reportAction, reportActionsForAncestor);
            if (!origID) {
                continue;
            }
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${origID}`;
            result[draftKey] = allDrafts[draftKey];
        }
        return result;
    };

    const [reportActionDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS, {selector: ancestorDraftSelector}, [ancestors, ancestorsReportActions, reportID]);

    const [editingState, setEditingState] = useState<EditingState>('off');
    const [prevEditingReportActionID, setPrevEditingReportActionID] = useState<string | null>(null);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [currentEditMessageSelection, setCurrentEditMessageSelectionState] = useState<TextSelection | null>(null);

    const reportDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`];

    let editingReportID: string | null = null;
    let editingReportActionID: string | null = null;
    let editingReportAction: OnyxTypes.ReportAction | null = null;

    const ancestorWithDraft = [...ancestors]
        .slice()
        .reverse()
        .find(({report: ancestorReport, reportAction}) => {
            const reportActionsForAncestor = ancestorsReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestorReport.reportID}`];
            const origID = getOriginalReportID(ancestorReport.reportID, reportAction, reportActionsForAncestor);
            if (!origID) {
                return false;
            }
            const ancestorDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${origID}`];
            const ancestorDraft = ancestorDrafts?.[reportAction.reportActionID];

            return ancestorDraft?.message !== undefined;
        });

    const updateMessage = (nextMessage: string | null) => {
        if (nextMessage == null) {
            return;
        }

        const didReportActionChange = prevEditingReportActionID !== editingReportActionID;
        if (didReportActionChange) {
            setEditingMessage(nextMessage);
            setPrevEditingReportActionID(editingReportActionID);
            const defaultSelection: TextSelection = {start: nextMessage.length, end: nextMessage.length};
            setCurrentEditMessageSelectionState(defaultSelection);
        }
    };

    if (ancestorWithDraft) {
        const {report: ancestorReport, reportAction: ancestorReportAction} = ancestorWithDraft;
        const reportActionsForAncestor = ancestorsReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestorReport.reportID}`];
        const ancestorOrigReportID = getOriginalReportID(ancestorReport.reportID, ancestorReportAction, reportActionsForAncestor);
        const ancestorDrafts = ancestorOrigReportID ? reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${ancestorOrigReportID}`] : undefined;
        const ancestorReportActionDraft = ancestorDrafts?.[ancestorReportAction.reportActionID];

        editingReportID = ancestorReport.reportID;
        editingReportActionID = ancestorReportAction.reportActionID;
        editingReportAction = ancestorReportAction;

        if (editingState === 'off') {
            setEditingState('editing');
        }

        const nextMessage = ancestorReportActionDraft?.message ?? null;
        updateMessage(nextMessage);
    } else if (reportDrafts) {
        const reportDraftEntry = Object.entries(reportDrafts).find(([, draft]) => draft?.message !== undefined);

        if (reportDraftEntry) {
            const [reportActionIDOfDraft, reportActionDraft] = reportDraftEntry;

            editingReportID = reportID ?? null;
            editingReportActionID = reportActionIDOfDraft;
            editingReportAction = reportActions?.[reportActionIDOfDraft] ?? null;

            if (editingState === 'off') {
                setEditingState('editing');
            }

            const nextMessage = reportActionDraft?.message ?? null;
            updateMessage(nextMessage);
        }
    }

    const submitEdit = () => {
        setEditingState('submitted');
    };

    const stopEditing = () => {
        setEditingState('off');
        setEditingMessage(null);
        setPrevEditingReportActionID(null);
        setCurrentEditMessageSelectionState(null);
    };

    if (editingReportID == null && editingState !== 'off') {
        stopEditing();
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
        setEditingMessage,
        setCurrentEditMessageSelection,
        submitEdit,
        stopEditing,
    };

    // When the report is navigated away from or the report changes, clear all report action edit drafts
    useEffect(() => {
        clearAllReportActionDrafts();

        return () => {
            clearAllReportActionDrafts();
        };
    }, [reportID]);

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
