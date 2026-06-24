import {renderHook} from '@testing-library/react-native';
import useRelevantSortedActions from '@hooks/useRelevantSortedActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReportAction from '@src/types/onyx/ReportAction';

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = onyxData[key];
    const selectedValue = options?.selector ? options.selector(value as never) : value;
    return [selectedValue];
});

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => mockUseOnyx(key, options),
}));

function makeReportAction(overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: '1',
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        created: '2024-01-01',
        ...overrides,
    } as ReportAction;
}

function makeReportPreviewAction(linkedReportID: string, overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: '1',
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        created: '2024-01-01',
        originalMessage: {linkedReportID},
        ...overrides,
    } as ReportAction;
}

describe('useRelevantSortedActions', () => {
    beforeEach(() => {
        for (const key of Object.keys(onyxData)) {
            delete onyxData[key];
        }
        mockUseOnyx.mockClear();
    });

    it('returns empty object when derived value is null', () => {
        const {result} = renderHook(() => useRelevantSortedActions(['report1']));
        expect(result.current).toEqual({});
    });

    it('returns empty object for empty reportIDs', () => {
        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {report1: [makeReportAction()]},
            lastActions: {},
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions([]));
        expect(result.current).toEqual({});
    });

    it('returns sorted actions for requested reportIDs', () => {
        const action1 = makeReportAction({reportActionID: 'a1'});
        const action2 = makeReportAction({reportActionID: 'a2'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [action1],
                report2: [action2],
                report3: [makeReportAction({reportActionID: 'a3'})],
            },
            lastActions: {},
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1', 'report2']));
        expect(result.current).toEqual({
            report1: [action1],
            report2: [action2],
        });
        expect(result.current).not.toHaveProperty('report3');
    });

    it('skips undefined reportIDs', () => {
        const action1 = makeReportAction({reportActionID: 'a1'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {report1: [action1]},
            lastActions: {},
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions([undefined, 'report1', undefined]));
        expect(result.current).toEqual({report1: [action1]});
    });

    it('skips reportIDs that have no sorted actions', () => {
        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {},
            lastActions: {},
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['nonexistent']));
        expect(result.current).toEqual({});
    });

    it('includes IOU report actions when last action is a REPORT_PREVIEW', () => {
        const reportAction = makeReportAction({reportActionID: 'a1'});
        const iouAction = makeReportAction({reportActionID: 'iou1'});
        const previewAction = makeReportPreviewAction('iouReport1', {reportActionID: 'preview1'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [reportAction],
                iouReport1: [iouAction],
            },
            lastActions: {
                report1: previewAction,
            },
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1']));
        expect(result.current).toEqual({
            report1: [reportAction],
            iouReport1: [iouAction],
        });
    });

    it('does not include IOU report when last action is not a REPORT_PREVIEW', () => {
        const reportAction = makeReportAction({reportActionID: 'a1'});
        const lastAction = makeReportAction({reportActionID: 'last1', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [reportAction],
                iouReport1: [makeReportAction({reportActionID: 'iou1'})],
            },
            lastActions: {
                report1: lastAction,
            },
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1']));
        expect(result.current).toEqual({report1: [reportAction]});
        expect(result.current).not.toHaveProperty('iouReport1');
    });

    it('does not include IOU report when linkedReportID has no sorted actions', () => {
        const reportAction = makeReportAction({reportActionID: 'a1'});
        const previewAction = makeReportPreviewAction('missingIouReport', {reportActionID: 'preview1'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [reportAction],
            },
            lastActions: {
                report1: previewAction,
            },
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1']));
        expect(result.current).toEqual({report1: [reportAction]});
    });

    it('handles multiple reports with mixed REPORT_PREVIEW and non-preview last actions', () => {
        const action1 = makeReportAction({reportActionID: 'a1'});
        const action2 = makeReportAction({reportActionID: 'a2'});
        const iouAction = makeReportAction({reportActionID: 'iou1'});
        const previewAction = makeReportPreviewAction('iouReport1', {reportActionID: 'preview1'});
        const commentAction = makeReportAction({reportActionID: 'comment1'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [action1],
                report2: [action2],
                iouReport1: [iouAction],
            },
            lastActions: {
                report1: previewAction,
                report2: commentAction,
            },
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1', 'report2']));
        expect(result.current).toEqual({
            report1: [action1],
            report2: [action2],
            iouReport1: [iouAction],
        });
    });

    it('calls useOnyx with the correct key and a selector', () => {
        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {},
            lastActions: {},
            transactionThreadIDs: {},
        };

        renderHook(() => useRelevantSortedActions(['report1']));

        expect(mockUseOnyx).toHaveBeenCalledWith(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, expect.objectContaining({selector: expect.any(Function)}));
    });
});
