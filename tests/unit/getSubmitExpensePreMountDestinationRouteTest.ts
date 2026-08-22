import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type * as SearchQueryUtils from '@libs/SearchQueryUtils';
import {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';

import getSubmitExpensePreMountDestinationRoute from '@pages/iou/request/step/confirmation/getSubmitExpensePreMountDestinationRoute';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/getIsNarrowLayout');
jest.mock('@libs/Navigation/helpers/isReportOpenInRHP');
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator');
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute');
jest.mock('@libs/Navigation/Navigation', () => ({
    getTopmostReportId: jest.fn(),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(),
    navigationRef: {getRootState: jest.fn()},
}));
jest.mock('@libs/SearchQueryUtils', () => ({
    buildCannedSearchQuery: jest.fn(({type}: {type: string}) => `type:${type}`),
    getCurrentSearchQueryJSON: jest.fn(() => undefined),
}));

const mockGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockIsReportOpenInRHP = jest.mocked(isReportOpenInRHP);
const mockIsReportTopmostSplitNavigator = jest.mocked(isReportTopmostSplitNavigator);
const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);

describe('getSubmitExpensePreMountDestinationRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(false);
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(false);
    });

    it('returns undefined on wide layout', () => {
        mockGetIsNarrowLayout.mockReturnValue(false);

        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: true,
                canPreInsertSearch: true,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('returns undefined when the transaction is not ready', () => {
        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: false,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: true,
                canPreInsertSearch: true,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('returns Search route for global create expense flows', () => {
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: undefined,
            destinationReport: undefined,
            isFromGlobalCreate: true,
            canPreInsertSearch: true,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}));
    });

    it('returns report route when the destination is not the report the user is looking at', () => {
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: false,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns undefined when relocating a tracked expense over a different visible report', () => {
        // The single-workspace "Submit to my employer" shape: the user is reading their self-DM while the expense is
        // bound to the workspace chat. Both are reports, so there is no tab to switch to and the pre-insert would
        // replace the report on screen - leaving the cancel path to rebuild it from a snapshot (#97437).
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('456');

        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: false,
                canPreInsertSearch: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: true,
            }),
        ).toBeUndefined();
    });

    it('keeps the pre-insert for an in-place expense whose destination is a different visible report', () => {
        // Same navigation topology as the case above, but the expense is created in place rather than relocated (e.g. the
        // per-diem chat-report destination), so it keeps the pre-mount instead of being caught by the track-expense guard.
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('456');

        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: false,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('stays eligible once it has pre-inserted, so the hook does not tear down its own insert', () => {
        // After the pre-insert the visible report *is* the destination, so the same-tab check reads as safe on its own.
        // Assert it through the explicit pre-inserted flag too, since that is what keeps the result stable.
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('456');
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);

        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: false,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: true,
        });

        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns the report route for a global-create track expense (self-DM target)', () => {
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.TRACK,
            isCreatingTrackExpense: true,
            isSelfDMDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns the report route when the sole recipient is the self-DM (CREATE routed through track)', () => {
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.CREATE,
            isCreatingTrackExpense: false,
            isSelfDMDestination: true,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('does NOT pre-insert the self-DM report for a LOOKING_AROUND user (they are routed to Search after submit)', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.CREATE,
            isCreatingTrackExpense: false,
            isSelfDMDestination: true,
            isLookingAroundUser: true,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toBeUndefined();
    });

    it('returns the report route for a report-bound global create (PAY)', () => {
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.PAY,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('still pre-inserts the report for a LOOKING_AROUND user when the destination is a real report, not the self-DM (PAY)', () => {
        // A LOOKING_AROUND user who later has a workspace and submits to a real report/friend must keep the report
        // pre-insert - the LOOKING_AROUND gate is scoped to isSelfDMDestination, so it does not fire here.
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.PAY,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isLookingAroundUser: true,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns undefined when the destination report is not loaded in Onyx', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: undefined,
                isFromGlobalCreate: false,
                canPreInsertSearch: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('returns undefined when report is already topmost', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('123');

        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: false,
                canPreInsertSearch: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('keeps returning the report route once it has been pre-inserted, even though it is now the topmost report', () => {
        // After this route is pre-inserted under the RHP, getTopmostReportId() reports the pre-inserted
        // destination. Without the pre-insert guard this flips hasValidDestination to false and the route
        // recomputes to undefined, tearing down the just-inserted route. The result must stay stable instead.
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('123');
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);

        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: true,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns undefined when report is open in RHP', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(true);

        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: false,
                canPreInsertSearch: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('returns Search route when Search is topmost with a different query type', () => {
        const {buildSearchQueryJSON} = jest.requireActual<typeof SearchQueryUtils>('@libs/SearchQueryUtils');

        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
        jest.mocked(getCurrentSearchQueryJSON).mockReturnValue(buildSearchQueryJSON('type:invoice'));

        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: undefined,
            destinationReport: undefined,
            isFromGlobalCreate: true,
            canPreInsertSearch: true,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}));
    });

    it('keeps returning the Search route once it has been pre-inserted, even though Search is now topmost with the same query type', () => {
        // After the Search route is pre-inserted under the RHP, isSearchTopmostFullScreenRoute() reports the pre-inserted Search
        // as topmost with a matching query type. Without the `|| hasPreInsertedFullscreen` guard, shouldPreInsertSearch flips to
        // false and the route recomputes to undefined, tearing down the just-inserted route. The result must stay stable instead.
        const {buildSearchQueryJSON} = jest.requireActual<typeof SearchQueryUtils>('@libs/SearchQueryUtils');

        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
        jest.mocked(getCurrentSearchQueryJSON).mockReturnValue(buildSearchQueryJSON('type:expense'));
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);

        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: undefined,
            destinationReport: undefined,
            isFromGlobalCreate: true,
            canPreInsertSearch: true,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        expect(route).toEqual(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}));
    });
});
