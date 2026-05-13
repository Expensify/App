import {renderHook} from '@testing-library/react-native';
import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useTransactionThreadReportID from '@hooks/useTransactionThreadReportID';
import {ReportActionEditMessageContextProvider, useReportActionActiveEdit} from '@pages/inbox/report/ReportActionEditMessageContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, ReportActionsDrafts} from '@src/types/onyx';
import {getFakeReport, getFakeReportAction} from '../../../../utils/LHNTestUtils';

jest.mock('@src/CONST', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@src/CONST');
    // Jest's Babel pipeline currently truncates the tail of the huge default CONST object (properties after PARTNER_ID).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    actual.default.REPORT_ACTION_EDIT_MESSAGE_STATE = {
        OFF: 'off',
        EDITING: 'editing',
        SUBMITTED: 'submitted',
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return actual;
});

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
    default: () => [],
}));

const mockUseOnyx = jest.fn();
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: unknown, opts?: {selector?: (collection: unknown) => unknown}) => mockUseOnyx(key, opts) as unknown[],
}));

const mockUseTransactionThreadReportID = jest.mocked(useTransactionThreadReportID);

const MAIN_REPORT_ID = '50001';
const THREAD_REPORT_ID = '50002';
const THREAD_ACTION_ID = '9001';
const MAIN_ACTION_ID = '9002';

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

describe('ReportActionEditMessageContextProvider — additional report IDs (transaction thread)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseTransactionThreadReportID.mockReturnValue({
            effectiveTransactionThreadReportID: undefined,
            transactionThreadReportID: undefined,
            reportActions: [],
        });
        mockUseOnyx.mockReturnValue([undefined]);
    });

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
