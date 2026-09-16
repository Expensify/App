import {act, renderHook} from '@testing-library/react-native';

import useAncestors from '@hooks/useAncestors';

import * as ReportUtils from '@libs/ReportUtils';

import {ReportActionEditMessageContextProvider, useReportActionActiveEdit, useReportActionActiveEditActions} from '@pages/inbox/report/ReportActionEditMessageContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';

import React from 'react';
import Onyx from 'react-native-onyx';

import {getFakeReport, getFakeReportAction} from '../../../../utils/LHNTestUtils';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useAncestors', () => ({
    __esModule: true,
    default: jest.fn(() => []),
}));

const mockUseAncestors = jest.mocked(useAncestors);

let getOriginalReportIDSpy: jest.SpiedFunction<typeof ReportUtils.getOriginalReportID>;

const MAIN_REPORT_ID = '50001';
const THREAD_REPORT_ID = '50002';
const THREAD_ACTION_ID = '9001';
const MAIN_ACTION_ID = '9002';
const ANCESTOR_REPORT_ID = '60001';
const ANCESTOR_ACTION_ID = '91003';

type BuildOnyxLayerParams = {
    mainReport: Report;
    mainReportActions: ReportActions;
    fullReportActionsCollection: ReportActionsCollectionDataSet;
    fullDraftsCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS>;
};

async function seedOnyxLayer(params: BuildOnyxLayerParams) {
    const reportCollectionDataSet: ReportCollectionDataSet = {
        [`${ONYXKEYS.COLLECTION.REPORT}${MAIN_REPORT_ID}`]: params.mainReport,
    };
    const reportActionsCollectionDataSet: ReportActionsCollectionDataSet = {
        ...params.fullReportActionsCollection,
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: params.mainReportActions,
    };
    await Onyx.multiSet({
        ...reportCollectionDataSet,
        ...reportActionsCollectionDataSet,
        ...params.fullDraftsCollection,
    });
    await waitForBatchedUpdatesWithAct();
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

async function renderActiveEditHook(effectiveTransactionThreadReportID?: string) {
    function EditProviderWrapper({children}: {children: React.ReactNode}) {
        return (
            <ReportActionEditMessageContextProvider
                effectiveTransactionThreadReportID={effectiveTransactionThreadReportID}
                reportID={MAIN_REPORT_ID}
            >
                {children}
            </ReportActionEditMessageContextProvider>
        );
    }

    const renderedHook = renderHook(() => useReportActionActiveEdit(), {
        wrapper: EditProviderWrapper,
    });
    await waitForBatchedUpdatesWithAct();
    return renderedHook;
}

async function renderActiveEditAndActionsHook(effectiveTransactionThreadReportID?: string) {
    function EditProviderWrapper({children}: {children: React.ReactNode}) {
        return (
            <ReportActionEditMessageContextProvider
                effectiveTransactionThreadReportID={effectiveTransactionThreadReportID}
                reportID={MAIN_REPORT_ID}
            >
                {children}
            </ReportActionEditMessageContextProvider>
        );
    }

    const renderedHook = renderHook(
        () => ({
            activeEdit: useReportActionActiveEdit(),
            activeEditActions: useReportActionActiveEditActions(),
        }),
        {
            wrapper: EditProviderWrapper,
        },
    );
    await waitForBatchedUpdatesWithAct();
    return renderedHook;
}

function resetProviderTestState() {
    jest.clearAllMocks();
    mockUseAncestors.mockReturnValue([]);
    getOriginalReportIDSpy.mockImplementation(() => undefined);
}

describe('ReportActionEditMessageContextProvider', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        // Spy the real export so the provider's import uses the same function (jest.mock replacement did not intercept calls).
        getOriginalReportIDSpy = jest.spyOn(ReportUtils, 'getOriginalReportID');
    });

    afterAll(() => {
        getOriginalReportIDSpy.mockRestore();
    });

    beforeEach(() => {
        resetProviderTestState();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    describe('transaction thread report', () => {
        it('surfaces an edit on the effective transaction thread when it differs from the visible report', async () => {
            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);

            const mainReport = createReportWithId(MAIN_REPORT_ID);
            const mainReportActions: ReportActions = {};

            const fullReportActionsCollection: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: mainReportActions,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'edited on thread',
                    },
                },
            };

            await seedOnyxLayer({
                mainReport,
                mainReportActions,
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = await renderActiveEditHook(THREAD_REPORT_ID);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);
            expect(result.current.editingReportID).toBe(THREAD_REPORT_ID);
            expect(result.current.editingReportActionID).toBe(THREAD_ACTION_ID);
            expect(result.current.editingReportAction).toEqual(threadReportAction);
            expect(result.current.editingMessage).toBe('edited on thread');
        });

        it('does not load transaction-thread drafts when effective thread ID is undefined', async () => {
            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            const fullReportActionsCollection: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'should be ignored',
                    },
                },
            };

            await seedOnyxLayer({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = await renderActiveEditHook();

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
        });

        it('does not load transaction-thread drafts when effective thread ID is the fake report ID', async () => {
            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            const fullReportActionsCollection: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'should be ignored',
                    },
                },
            };

            await seedOnyxLayer({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = await renderActiveEditHook(CONST.FAKE_REPORT_ID);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
        });

        it('does not load transaction-thread drafts when effective thread ID equals the visible report ID', async () => {
            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            const fullReportActionsCollection: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'draft only on separate thread key',
                    },
                },
            };

            await seedOnyxLayer({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = await renderActiveEditHook(MAIN_REPORT_ID);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
        });

        it('does not surface additional edits when a draft exists without its report action', async () => {
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            const fullReportActionsCollection: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {},
            };

            const fullDraftsCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: {
                        message: 'orphan draft',
                    },
                },
            };

            await seedOnyxLayer({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = await renderActiveEditHook(THREAD_REPORT_ID);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
        });

        it('prefers the main report draft over a transaction-thread draft when both exist', async () => {
            const mainReportAction = createReportActionWithId(MAIN_ACTION_ID);
            const threadReportAction = createReportActionWithId(THREAD_ACTION_ID);

            const mainReport = createReportWithId(MAIN_REPORT_ID);
            const mainReportActions: ReportActions = {
                [MAIN_ACTION_ID]: mainReportAction,
            };

            const fullReportActionsCollection: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: mainReportActions,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${THREAD_REPORT_ID}`]: {
                    [THREAD_ACTION_ID]: threadReportAction,
                },
            };

            const fullDraftsCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS> = {
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

            await seedOnyxLayer({
                mainReport,
                mainReportActions,
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = await renderActiveEditHook(THREAD_REPORT_ID);

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);
            expect(result.current.editingReportID).toBe(MAIN_REPORT_ID);
            expect(result.current.editingReportActionID).toBe(MAIN_ACTION_ID);
            expect(result.current.editingMessage).toBe('main wins');
        });
    });

    describe('ancestor drafts', () => {
        it('prefers an ancestor draft over the main report draft', async () => {
            const ancestorReport = createReportWithId(ANCESTOR_REPORT_ID);
            const ancestorAction = createReportActionWithId(ANCESTOR_ACTION_ID);
            const mainReportAction = createReportActionWithId(MAIN_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            mockUseAncestors.mockReturnValue([{report: ancestorReport, reportAction: ancestorAction, shouldDisplayNewMarker: false}]);
            getOriginalReportIDSpy.mockImplementation(() => ANCESTOR_REPORT_ID);

            const fullReportActionsCollection: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {
                    [MAIN_ACTION_ID]: mainReportAction,
                },
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ANCESTOR_REPORT_ID}`]: {
                    [ANCESTOR_ACTION_ID]: ancestorAction,
                },
            };

            const fullDraftsCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS> = {
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

            await seedOnyxLayer({
                mainReport,
                mainReportActions: {
                    [MAIN_ACTION_ID]: mainReportAction,
                },
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = await renderActiveEditHook();

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);
            expect(result.current.editingReportID).toBe(ANCESTOR_REPORT_ID);
            expect(result.current.editingReportActionID).toBe(ANCESTOR_ACTION_ID);
            expect(result.current.editingReportAction).toEqual(ancestorAction);
            expect(result.current.editingMessage).toBe('ancestor draft message');
        });
    });

    describe('main report draft only', () => {
        it('surfaces a draft on the visible report when there are no ancestors', async () => {
            const mainReportAction = createReportActionWithId(MAIN_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);
            const mainReportActions: ReportActions = {
                [MAIN_ACTION_ID]: mainReportAction,
            };

            const fullReportActionsCollection: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: mainReportActions,
            };

            const fullDraftsCollection: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {
                    [MAIN_ACTION_ID]: {
                        message: 'local edit',
                    },
                },
            };

            await seedOnyxLayer({
                mainReport,
                mainReportActions,
                fullReportActionsCollection,
                fullDraftsCollection,
            });

            const {result} = await renderActiveEditHook();

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

        it('stays off when there are no drafts', async () => {
            const mainReport = createReportWithId(MAIN_REPORT_ID);

            await seedOnyxLayer({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                },
                fullDraftsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                },
            });

            const {result} = await renderActiveEditHook();

            expect(result.current.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF);
            expect(result.current.editingReportID).toBeNull();
            expect(result.current.editingMessage).toBeNull();
            expect(result.current.currentEditMessageSelection).toBeNull();
        });
    });

    describe('actions', () => {
        function localDraftOnyxData(): BuildOnyxLayerParams {
            const mainReportAction = createReportActionWithId(MAIN_ACTION_ID);
            const mainReport = createReportWithId(MAIN_REPORT_ID);
            const mainReportActions: ReportActions = {
                [MAIN_ACTION_ID]: mainReportAction,
            };

            return {
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
            };
        }

        it('sets editing state to submitted when submitEdit runs', async () => {
            await seedOnyxLayer(localDraftOnyxData());
            const {result} = await renderActiveEditAndActionsHook();

            expect(result.current.activeEdit.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING);

            act(() => {
                result.current.activeEditActions.submitEdit();
            });

            expect(result.current.activeEdit.editingState).toBe(CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.SUBMITTED);
        });

        it('clears transient state when stopEditing runs and no draft re-applies edit mode', async () => {
            const mainReport = createReportWithId(MAIN_REPORT_ID);
            await seedOnyxLayer({
                mainReport,
                mainReportActions: {},
                fullReportActionsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MAIN_REPORT_ID}`]: {},
                },
                fullDraftsCollection: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${MAIN_REPORT_ID}`]: {},
                },
            });

            const {result} = await renderActiveEditAndActionsHook();

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

        it('updates currentEditMessageSelection while editing', async () => {
            await seedOnyxLayer(localDraftOnyxData());
            const {result} = await renderActiveEditAndActionsHook();

            const nextSelection = {start: 0, end: 4};

            act(() => {
                result.current.activeEditActions.setCurrentEditMessageSelection(nextSelection);
            });

            expect(result.current.activeEdit.currentEditMessageSelection).toEqual(nextSelection);
        });

        it('ignores setCurrentEditMessageSelection when not in editing state', async () => {
            await seedOnyxLayer(localDraftOnyxData());
            const {result} = await renderActiveEditAndActionsHook();

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

        it('updates editing message via setEditingMessage', async () => {
            await seedOnyxLayer(localDraftOnyxData());
            const {result} = await renderActiveEditAndActionsHook();

            act(() => {
                result.current.activeEditActions.setEditingMessage('replaced');
            });

            expect(result.current.activeEdit.editingMessage).toBe('replaced');
        });
    });
});
