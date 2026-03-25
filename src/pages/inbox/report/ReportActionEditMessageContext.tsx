import {useIsFocused} from '@react-navigation/native';
import React, {createContext, useCallback, useContext, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {TextSelection} from '@components/Composer/types';
import useAncestors from '@hooks/useAncestors';
import useOnyx from '@hooks/useOnyx';
import {getOriginalReportID, shouldExcludeAncestorReportAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

function NOOP() {
    return null;
}

type EditingState = 'off' | 'editing' | 'submitted';

type ReportActionActiveEdit = {
    editingReportID: string | null;
    editingReportActionID: string | null;
    editingReportAction: OnyxTypes.ReportAction | null;
    editingMessage: string | null;
};

type ReportActionEditMessageContextValue = ReportActionActiveEdit & {
    currentEditMessageSelection: TextSelection | null;
    editingState: EditingState;
};

type ReportActionEditMessageContextActions = {
    setEditingMessage: Dispatch<SetStateAction<string | null>>;
    setCurrentEditMessageSelection: Dispatch<SetStateAction<TextSelection | null>>;
    submitEdit: () => void;
    stopEditing: () => void;
};

const ReportActionEditMessageContext = createContext<ReportActionEditMessageContextValue>({
    editingReportID: null,
    editingReportActionID: null,
    editingReportAction: null,
    editingMessage: null,
    currentEditMessageSelection: null,
    editingState: 'off',
});

const ReportActionEditMessageActionsContext = createContext<ReportActionEditMessageContextActions>({
    setEditingMessage: NOOP,
    setCurrentEditMessageSelection: NOOP,
    submitEdit: NOOP,
    stopEditing: NOOP,
});

type ReportActionEditMessageContextProviderProps = {
    reportID: string | undefined;
    children: React.ReactNode;
};

function ReportActionEditMessageContextProvider({reportID, children}: ReportActionEditMessageContextProviderProps) {
    const isFocused = useIsFocused();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
    });

    const ancestors = useAncestors(report, shouldExcludeAncestorReportAction);

    const ancestorReportActionsSelector = useCallback(
        (allReportActions: OnyxCollection<OnyxTypes.ReportActions>) => {
            if (!allReportActions) {
                return {};
            }
            const result: OnyxCollection<OnyxTypes.ReportActions> = {};
            for (const ancestor of ancestors) {
                const key = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestor.report.reportID}`;
                result[key] = allReportActions[key];
            }
            return result;
        },
        [ancestors],
    );

    const [ancestorsReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: ancestorReportActionsSelector}, [ancestors]);

    const ancestorDraftSelector = useCallback(
        (allDrafts: OnyxCollection<OnyxTypes.ReportActionsDrafts>) => {
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
        },
        [ancestors, ancestorsReportActions, reportID],
    );

    const [reportActionDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS, {selector: ancestorDraftSelector}, [ancestors, ancestorsReportActions, reportID]);

    const [editingState, setEditingState] = useState<EditingState>('off');
    const [prevEditingReportActionID, setPrevEditingReportActionID] = useState<string | null>(null);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [currentEditMessageSelection, setCurrentEditMessageSelectionState] = useState<TextSelection | null>(null);

    const reportDrafts = reportActionDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`];

    let editingReportID: string | null = null;
    let editingReportActionID: string | null = null;
    let editingReportAction: OnyxTypes.ReportAction | null = null;

    if (isFocused) {
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
