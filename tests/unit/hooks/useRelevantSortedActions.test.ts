import {renderHook} from '@testing-library/react-native';
import useRelevantSortedActions from '@hooks/useRelevantSortedActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReportAction from '@src/types/onyx/ReportAction';

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = onyxData[key];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test mock needs to pass unknown data through the selector
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

    it('includes IOU report actions when a REPORT_PREVIEW exists in sorted actions', () => {
        const previewAction = makeReportPreviewAction('iouReport1', {reportActionID: 'preview1'});
        const iouAction = makeReportAction({reportActionID: 'iou1'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [previewAction],
                iouReport1: [iouAction],
            },
            lastActions: {},
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1']));
        expect(result.current).toEqual({
            report1: [previewAction],
            iouReport1: [iouAction],
        });
    });

    it('includes IOU report even when a non-visible action sits above the REPORT_PREVIEW', () => {
        const whisperAction = makeReportAction({reportActionID: 'whisper1', created: '2024-01-02'});
        const previewAction = makeReportPreviewAction('iouReport1', {reportActionID: 'preview1', created: '2024-01-01'});
        const iouAction = makeReportAction({reportActionID: 'iou1'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [whisperAction, previewAction],
                iouReport1: [iouAction],
            },
            lastActions: {
                report1: whisperAction,
            },
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1']));
        expect(result.current).toEqual({
            report1: [whisperAction, previewAction],
            iouReport1: [iouAction],
        });
    });

    it('does not include IOU report when no REPORT_PREVIEW exists in sorted actions', () => {
        const commentAction = makeReportAction({reportActionID: 'a1'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [commentAction],
                iouReport1: [makeReportAction({reportActionID: 'iou1'})],
            },
            lastActions: {},
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1']));
        expect(result.current).toEqual({report1: [commentAction]});
        expect(result.current).not.toHaveProperty('iouReport1');
    });

    it('does not include IOU report when linkedReportID has no sorted actions', () => {
        const previewAction = makeReportPreviewAction('missingIouReport', {reportActionID: 'preview1'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [previewAction],
            },
            lastActions: {},
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1']));
        expect(result.current).toEqual({report1: [previewAction]});
    });

    it('includes multiple IOU reports from multiple REPORT_PREVIEW actions', () => {
        const preview1 = makeReportPreviewAction('iouReport1', {reportActionID: 'preview1', created: '2024-01-02'});
        const preview2 = makeReportPreviewAction('iouReport2', {reportActionID: 'preview2', created: '2024-01-01'});
        const iouAction1 = makeReportAction({reportActionID: 'iou1'});
        const iouAction2 = makeReportAction({reportActionID: 'iou2'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [preview1, preview2],
                iouReport1: [iouAction1],
                iouReport2: [iouAction2],
            },
            lastActions: {},
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1']));
        expect(result.current).toEqual({
            report1: [preview1, preview2],
            iouReport1: [iouAction1],
            iouReport2: [iouAction2],
        });
    });

    it('handles multiple reports with mixed REPORT_PREVIEW and non-preview actions', () => {
        const previewAction = makeReportPreviewAction('iouReport1', {reportActionID: 'preview1'});
        const commentAction = makeReportAction({reportActionID: 'a2'});
        const iouAction = makeReportAction({reportActionID: 'iou1'});

        onyxData[ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS] = {
            sortedActions: {
                report1: [previewAction],
                report2: [commentAction],
                iouReport1: [iouAction],
            },
            lastActions: {},
            transactionThreadIDs: {},
        };

        const {result} = renderHook(() => useRelevantSortedActions(['report1', 'report2']));
        expect(result.current).toEqual({
            report1: [previewAction],
            report2: [commentAction],
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any() returns AsymmetricMatcher typed as any
        expect(mockUseOnyx).toHaveBeenCalledWith(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, expect.objectContaining({selector: expect.any(Function)}));
    });
});
