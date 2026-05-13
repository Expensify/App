import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useAncestors from '@hooks/useAncestors';
import useTransactionThreadReportID from '@hooks/useTransactionThreadReportID';
import * as ReportUtils from '@libs/ReportUtils';
import {ReportActionEditMessageContextProvider, useReportActionActiveEdit, useReportActionActiveEditActions} from '@pages/inbox/report/ReportActionEditMessageContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, ReportActionsDrafts} from '@src/types/onyx';
import {getFakeReport, getFakeReportAction} from '../../../../utils/LHNTestUtils';

jest.mock('@hooks/useTransactionThreadReportID', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        effectiveTransactionThreadReportID: undefined,
        transactionThreadReportID: undefined,
        reportActions: [],
    })),
}));

jest.mock('@hooks/useAncestors', () => ({
    __esModule: true,
    default: jest.fn(() => []),
}));

const mockUseOnyx = jest.fn();
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: unknown, opts?: {selector?: (collection: unknown) => unknown}) => mockUseOnyx(key, opts) as unknown[],
}));

const mockUseTransactionThreadReportID = jest.mocked(useTransactionThreadReportID);
const mockUseAncestors = jest.mocked(useAncestors);

let getOriginalReportIDSpy: jest.SpiedFunction<typeof ReportUtils.getOriginalReportID>;

const MAIN_REPORT_ID = '50001';
const THREAD_REPORT_ID = '50002';
const THREAD_ACTION_ID = '9001';
const MAIN_ACTION_ID = '9002';
const ANCESTOR_REPORT_ID = '60001';
const ANCESTOR_ACTION_ID = '91003';

type OnyxSelectorOptions = {selector?: (collection: unknown) => unknown};

type BuildOnyxLayerParams = {
    mainReport: Report;
    mainReportActions: ReportActions;
    fullReportActionsCollection: OnyxCollection<ReportActions>;
    fullDraftsCollection: OnyxCollection<ReportActionsDrafts>;
};

function buildUseOnyxImplementation(params: BuildOnyxLayerParams) {
    return (key: unknown, opts?: OnyxSelectorOptions) => {
        const keyStr = key as string;

        if (keyStr === `${ONYXKEYS.COLLECTION.REPORT}${MAIN_REPORT_ID}`) {
            return [params.mainReport];
        }

        if (keyStr === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`) {
            return [params.mainReportActions];
        }

        if (keyStr === ONYXKEYS.COLLECTION.REPORT_ACTIONS && opts?.selector) {
            return [opts.selector(params.fullReportActionsCollection)];
        }

        if (keyStr === ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS && opts?.selector) {
            return [opts.selector(params.fullDraftsCollection)];
        }

        return [undefined];
    };
}

function createReportWithId(reportID: string): Report {
    const base = getFakeReport();
    return {
        ...base,
        reportID,
    };
}

function createReportActionWithId(reportActionID: string): ReportAction {
    const base = getFakeReportAction();
    return {
        ...base,
        reportActionID,
    };
}

function renderActiveEditHook(mockImplementation: ReturnType<typeof buildUseOnyxImplementation>) {
    mockUseOnyx.mockImplementation(mockImplementation);

    return renderHook(() => useReportActionActiveEdit(), {
        wrapper: ({children}: {children: React.ReactNode}) => <ReportActionEditMessageContextProvider reportID={MAIN_REPORT_ID}>{children}</ReportActionEditMessageContextProvider>,
    });
}

function renderActiveEditAndActionsHook(mockImplementation: ReturnType<typeof buildUseOnyxImplementation>) {
    mockUseOnyx.mockImplementation(mockImplementation);

    return renderHook(
        () => ({
            activeEdit: useReportActionActiveEdit(),
            activeEditActions: useReportActionActiveEditActions(),
        }),
        {
            wrapper: ({children}: {children: React.ReactNode}) => <ReportActionEditMessageContextProvider reportID={MAIN_REPORT_ID}>{children}</ReportActionEditMessageContextProvider>,
        },
    );
}

function resetProviderTestState() {
    jest.clearAllMocks();
    mockUseAncestors.mockReturnValue([]);
    getOriginalReportIDSpy.mockImplementation(() => undefined);
    mockUseTransactionThreadReportID.mockReturnValue({
        effectiveTransactionThreadReportID: undefined,
        transactionThreadReportID: undefined,
        reportActions: [],
    });
    mockUseOnyx.mockReturnValue([undefined]);
}

describe('ReportActionEditMessageContextProvider', () => {
    beforeAll(() => {
        // Spy the real export so the provider's import uses the same function (jest.mock replacement did not intercept calls).
        getOriginalReportIDSpy = jest.spyOn(ReportUtils, 'getOriginalReportID');
    });

    afterAll(() => {
        getOriginalReportIDSpy.mockRestore();
    });

    beforeEach(() => {
        resetProviderTestState();
    });

    describe('additional report IDs (transaction thread)', () => {
        it('surfaces an edit on the effective transaction thread when it differs from the visible report', () => {
            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);

            mockUseTransactionThreadReportID.mockReturnValue({
                effectiveTransactionThreadReportID: THREAD_REPORT_ID,
                transactionThreadReportID: THREAD_REPORT_ID,
                reportActions: [],
            });

            const mainReport = createReportWithId(MAIN_REPORT_ID);
            const mainReportActions: ReportActions = {};

            const fullReportActionsCollection: OnyxCollection<ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: mainReportActions,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: OnyxCollection<ReportActionsDrafts> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'edited on thread',
                    },
                },
            };

            const mockImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions,
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = renderActiveEditHook(mockImpl);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);
            expect(result.current.editingReportID).toBe(THREAD_REPORT_ID);
            expect(result.current.editingReportActionID).toBe(THREAD_ACTION_ID);
            expect(result.current.editingReportAction).toEqual(threadReportAction);
            expect(result.current.editingMessage).toBe('edited on thread');
        });

        it('does not load transaction-thread drafts when effective thread ID is undefined', () => {
            mockUseTransactionThreadReportID.mockReturnValue({
                effectiveTransactionThreadReportID: undefined,
                transactionThreadReportID: THREAD_REPORT_ID,
                reportActions: [],
            });

            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            const fullReportActionsCollection: OnyxCollection<ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: OnyxCollection<ReportActionsDrafts> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'should be ignored',
                    },
                },
            };

            const mockImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = renderActiveEditHook(mockImpl);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
        });

        it('does not load transaction-thread drafts when effective thread ID is the fake report ID', () => {
            mockUseTransactionThreadReportID.mockReturnValue({
                effectiveTransactionThreadReportID: CONST.FAKE_REPORT_ID,
                transactionThreadReportID: CONST.FAKE_REPORT_ID,
                reportActions: [],
            });

            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            const fullReportActionsCollection: OnyxCollection<ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: OnyxCollection<ReportActionsDrafts> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'should be ignored',
                    },
                },
            };

            const mockImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = renderActiveEditHook(mockImpl);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
        });

        it('does not load transaction-thread drafts when effective thread ID equals the visible report ID', () => {
            mockUseTransactionThreadReportID.mockReturnValue({
                effectiveTransactionThreadReportID: MAIN_REPORT_ID,
                transactionThreadReportID: MAIN_REPORT_ID,
                reportActions: [],
            });

            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            const fullReportActionsCollection: OnyxCollection<ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: OnyxCollection<ReportActionsDrafts> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'draft only on separate thread key',
                    },
                },
            };

            const mockImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = renderActiveEditHook(mockImpl);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
        });

        it('does not surface additional edits when a draft exists without its report action', () => {
            mockUseTransactionThreadReportID.mockReturnValue({
                effectiveTransactionThreadReportID: THREAD_REPORT_ID,
                transactionThreadReportID: THREAD_REPORT_ID,
                reportActions: [],
            });

            const mainReport = createReportWithId(MAIN_REPORT_ID);

            const fullReportActionsCollection: OnyxCollection<ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {},
            };

            const fullDraftsCollection: OnyxCollection<ReportActionsDrafts> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'orphan draft',
                    },
                },
            };

            const mockImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = renderActiveEditHook(mockImpl);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
        });

        it('prefers the main report draft over a transaction-thread draft when both exist', () => {
            const mainReportAction = createReportActionWithId(MAIN_ACTION_ID);
            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);

            mockUseTransactionThreadReportID.mockReturnValue({
                effectiveTransactionThreadReportID: THREAD_REPORT_ID,
                transactionThreadReportID: THREAD_REPORT_ID,
                reportActions: [],
            });

            const mainReport = createReportWithId(MAIN_REPORT_ID);
            const mainReportActions: ReportActions = {
                [MAIN_ACTION_ID]: mainReportAction,
            };

            const fullReportActionsCollection: OnyxCollection<ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: mainReportActions,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: OnyxCollection<ReportActionsDrafts> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {
                    [MAIN_ACTION_ID]: {
                        message: 'main wins',
                    },
                },
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'thread loses',
                    },
                },
            };

            const mockImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions,
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = renderActiveEditHook(mockImpl);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);
            expect(result.current.editingReportID).toBe(MAIN_REPORT_ID);
            expect(result.current.editingReportActionID).toBe(MAIN_ACTION_ID);
            expect(result.current.editingMessage).toBe('main wins');
        });
    });

    describe('ancestor drafts', () => {
        it('prefers an ancestor draft over the main report draft', () => {
            const ancestorReport = createReportWithId(ANCESTOR_REPORT_ID);
            const ancestorAction = createReportActionWithId(ANCESTOR_ACTION_ID);
            const mainReportAction = createReportActionWithId(MAIN_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            mockUseAncestors.mockReturnValue([{report: ancestorReport, reportAction: ancestorAction, shouldDisplayNewMarker: false}]);
            getOriginalReportIDSpy.mockImplementation(() => ANCESTOR_REPORT_ID);

            const fullReportActionsCollection: OnyxCollection<ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {
                    [MAIN_ACTION_ID]: mainReportAction,
                },
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ANCESTOR_REPORT_ID}`]: {
                    [ANCESTOR_ACTION_ID]: ancestorAction,
                },
            };

            const fullDraftsCollection: OnyxCollection<ReportActionsDrafts> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {
                    [MAIN_ACTION_ID]: {
                        message: 'main draft message',
                    },
                },
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${ANCESTOR_REPORT_ID}`]: {
                    [ANCESTOR_ACTION_ID]: {
                        message: 'ancestor draft message',
                    },
                },
            };

            const mockImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions: {
                    [MAIN_ACTION_ID]: mainReportAction,
                },
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = renderActiveEditHook(mockImpl);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);
            expect(result.current.editingReportID).toBe(ANCESTOR_REPORT_ID);
            expect(result.current.editingReportActionID).toBe(ANCESTOR_ACTION_ID);
            expect(result.current.editingReportAction).toEqual(ancestorAction);
            expect(result.current.editingMessage).toBe('ancestor draft message');
        });
    });

    describe('main report draft only', () => {
        it('surfaces a draft on the visible report when there are no ancestors', () => {
            const mainReportAction = createReportActionWithId(MAIN_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);
            const mainReportActions: ReportActions = {
                [MAIN_ACTION_ID]: mainReportAction,
            };

            const fullReportActionsCollection: OnyxCollection<ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: mainReportActions,
            };

            const fullDraftsCollection: OnyxCollection<ReportActionsDrafts> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {
                    [MAIN_ACTION_ID]: {
                        message: 'local edit',
                    },
                },
            };

            const mockImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions,
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = renderActiveEditHook(mockImpl);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);
            expect(result.current.editingReportID).toBe(MAIN_REPORT_ID);
            expect(result.current.editingReportActionID).toBe(MAIN_ACTION_ID);
            expect(result.current.editingReportAction).toEqual(mainReportAction);
            expect(result.current.editingMessage).toBe('local edit');
            expect(result.current.currentEditMessageSelection).toEqual({
                start: 'local edit'.length,
                end: 'local edit'.length,
            });
        });

        it('stays off when there are no drafts', () => {
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            const mockImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                },
                fullDraftsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                },
            });

            const {result} = renderActiveEditHook(mockImpl);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
            expect(result.current.editingMessage).toBeNull();
            expect(result.current.currentEditMessageSelection).toBeNull();
        });
    });

    describe('actions', () => {
        function localDraftMock() {
            const mainReportAction = createReportActionWithId(MAIN_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);
            const mainReportActions: ReportActions = {
                [MAIN_ACTION_ID]: mainReportAction,
            };

            return buildUseOnyxImplementation({
                mainReport,
                mainReportActions,
                fullReportActionsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: mainReportActions,
                },
                fullDraftsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {
                        [MAIN_ACTION_ID]: {
                            message: 'draft body',
                        },
                    },
                },
            });
        }

        it('sets editing state to submitted when submitEdit runs', () => {
            const {result} = renderActiveEditAndActionsHook(localDraftMock());

            expect(result.current.activeEdit.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);

            act(() => {
                result.current.activeEditActions.submitEdit();
            });

            expect(result.current.activeEdit.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.SUBMITTED);
        });

        it('clears transient state when stopEditing runs and no draft re-applies edit mode', () => {
            const mainReport = createReportWithId(MAIN_REPORT_ID);
            const emptyDraftsImpl = buildUseOnyxImplementation({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                },
                fullDraftsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                },
            });

            const {result} = renderActiveEditAndActionsHook(emptyDraftsImpl);

            expect(result.current.activeEdit.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);

            act(() => {
                result.current.activeEditActions.setEditingMessage('leftover');
            });

            act(() => {
                result.current.activeEditActions.stopEditing();
            });

            expect(result.current.activeEdit.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.activeEdit.editingReportID).toBeNull();
            expect(result.current.activeEdit.editingMessage).toBeNull();
            expect(result.current.activeEdit.currentEditMessageSelection).toBeNull();
        });

        it('updates currentEditMessageSelection while editing', () => {
            const {result} = renderActiveEditAndActionsHook(localDraftMock());

            const nextSelection = {start: 0, end: 4};

            act(() => {
                result.current.activeEditActions.setCurrentEditMessageSelection(nextSelection);
            });

            expect(result.current.activeEdit.currentEditMessageSelection).toEqual(nextSelection);
        });

        it('ignores setCurrentEditMessageSelection when not in editing state', () => {
            const {result} = renderActiveEditAndActionsHook(localDraftMock());

            act(() => {
                result.current.activeEditActions.submitEdit();
            });

            const selectionAfterSubmit = result.current.activeEdit.currentEditMessageSelection;

            act(() => {
                result.current.activeEditActions.setCurrentEditMessageSelection({start: 0, end: 1});
            });

            expect(result.current.activeEdit.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.SUBMITTED);
            expect(result.current.activeEdit.currentEditMessageSelection).toEqual(selectionAfterSubmit);
        });

        it('updates editing message via setEditingMessage', () => {
            const {result} = renderActiveEditAndActionsHook(localDraftMock());

            act(() => {
                result.current.activeEditActions.setEditingMessage('replaced');
            });

            expect(result.current.activeEdit.editingMessage).toBe('replaced');
        });
    });
});
