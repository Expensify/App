import CONST from '@src/CONST';
import {ReportAction, ReportActionsPages} from '@src/types/onyx';
import Pagination from '../../src/libs/actions/Pagination';

describe('Pagination', () => {
    type PaginationTestCaseInputs = {
        sortedReportActions: Partial<ReportAction>[];
        currentPages: ReportActionsPages;
        pageStart: string;
        pageEnd: string;
        isStartingFromMiddle?: boolean;
    };
    test.each([
        [
            {
                // TODO: make IDs non-sequential to avoid coincidental test passes
                sortedReportActions: [{reportActionID: '6'}, {reportActionID: '7'}, {reportActionID: '8'}, {reportActionID: '9'}, {reportActionID: '10'}],
                currentPages: [],
                pageStart: '6',
                pageEnd: '10',
            },
            [CONST.PAGE_MARKER.GAP, ['6', '10']],
        ],
        [
            {
                sortedReportActions: [{reportActionID: '6'}, {reportActionID: '7'}, {reportActionID: '8'}, {reportActionID: '9'}, {reportActionID: '10'}, {reportActionID: '11'}],
                currentPages: [['6', '10']],
                pageStart: '11',
                pageEnd: '11',
            },
            [CONST.PAGE_MARKER.GAP, ['6', '11']],
        ],
        [
            {
                sortedReportActions: [
                    {reportActionID: '6'},
                    {reportActionID: '7'},
                    {reportActionID: '8'},
                    {reportActionID: '88'},
                    {reportActionID: '9'},
                    {reportActionID: '10'},
                    {reportActionID: '11'},
                ],
                currentPages: [['6', '11']],
                pageStart: '88',
                pageEnd: '88',
            },
            [CONST.PAGE_MARKER.GAP, ['6', '11']],
        ],
        [
            {
                sortedReportActions: [
                    {reportActionID: '2'},
                    {reportActionID: '6'},
                    {reportActionID: '7'},
                    {reportActionID: '8'},
                    {reportActionID: '88'},
                    {reportActionID: '9'},
                    {reportActionID: '10'},
                    {reportActionID: '11'},
                ],
                currentPages: [['6', '11']],
                pageStart: '2',
                pageEnd: '2',
            },
            [['2', '2'], CONST.PAGE_MARKER.GAP, ['6', '11']],
        ],
        [
            {
                sortedReportActions: [
                    {reportActionID: '1'},
                    {reportActionID: '2'},
                    {reportActionID: '3'},
                    {reportActionID: '4'},
                    {reportActionID: '5'},
                    {reportActionID: '6'},
                    {reportActionID: '7'},
                    {reportActionID: '8'},
                    {reportActionID: '88'},
                    {reportActionID: '9'},
                    {reportActionID: '10'},
                    {reportActionID: '11'},
                ],
                currentPages: [['2', '2'], CONST.PAGE_MARKER.GAP, ['6', '11']],
                pageStart: '1',
                pageEnd: '5',
            },
            [CONST.PAGE_MARKER.GAP, ['1', '11']],
        ],
        [
            {
                sortedReportActions: [
                    {reportActionID: '0'}, // TODO: Make this a CREATED action
                    {reportActionID: '1'},
                    {reportActionID: '2'},
                    {reportActionID: '3'},
                    {reportActionID: '4'},
                    {reportActionID: '5'},
                    {reportActionID: '6'},
                    {reportActionID: '7'},
                    {reportActionID: '8'},
                    {reportActionID: '88'},
                    {reportActionID: '9'},
                    {reportActionID: '10'},
                    {reportActionID: '11'},
                ],
                currentPages: [CONST.PAGE_MARKER.GAP, ['1', '11']],
                pageStart: '0',
                pageEnd: '0',
            },
            [CONST.PAGE_MARKER.END, ['0', '11']],
        ],
    ] as const satisfies [PaginationTestCaseInputs, ReportActionsPages][])(
        'mergePagesWithGapDetection($sortedReportActions, $currentPages, $pageStart, $pageEnd, $isStartingFromMiddle)',
        ({sortedReportActions, currentPages, pageStart, pageEnd, isStartingFromMiddle = false}, expectedOutput) => {
            expect(
                Pagination.mergePagesWithGapDetection(sortedReportActions as unknown as ReportAction[], currentPages as ReportActionsPages, pageStart, pageEnd, isStartingFromMiddle),
            ).toStrictEqual(expectedOutput);
        },
    );

    test.each([
        [
            {
                sortedReportActions: [{reportActionID: '6'}, {reportActionID: '7'}, {reportActionID: '8'}, {reportActionID: '9'}, {reportActionID: '10'}],
                currentPages: [],
                pageStart: '6',
                pageEnd: '10',
            },
            [CONST.PAGE_MARKER.GAP, ['6', '11'], CONST.PAGE_MARKER.GAP],
        ],
        [
            {
                sortedReportActions: [
                    {reportActionID: '6'},
                    {reportActionID: '7'},
                    {reportActionID: '8'},
                    {reportActionID: '9'},
                    {reportActionID: '10'},
                    {reportActionID: '16'},
                    {reportActionID: '17'},
                    {reportActionID: '18'},
                    {reportActionID: '19'},
                    {reportActionID: '20'},
                ],
                currentPages: [CONST.PAGE_MARKER.GAP, ['6', '11'], CONST.PAGE_MARKER.GAP],
                pageStart: '',
            },
        ],
    ])('mergePagesWithGapDetection($sortedReportActions, $currentPages, $pageStart, $pageEnd, true)', ({sortedReportActions, currentPages, pageStart, pageEnd}, expectedOutput) => {
        expect(Pagination.mergePagesWithGapDetection(sortedReportActions as ReportAction[], currentPages as ReportActionsPages, pageStart, pageEnd, true)).toStrictEqual(expectedOutput);
    });
});
