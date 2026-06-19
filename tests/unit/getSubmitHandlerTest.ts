import type {SubmitNavigationSnapshot} from '@pages/iou/request/step/confirmation/getSubmitHandler';
import {canUseDismissModalFastPath, getSubmitHandler, SUBMIT_HANDLER} from '@pages/iou/request/step/confirmation/getSubmitHandler';

const BASE_SNAPSHOT: SubmitNavigationSnapshot = {
    isPreInserted: false,
    isReportPreInserted: false,
    isFromGlobalCreate: false,
    canDismissFromSearch: false,
    navigatesToDestinationReport: false,
    destinationReportID: undefined,
    isReportInRHP: false,
    isReportTopmostSplit: false,
    isSearchTopmostFullScreen: false,
    isDestinationReportLoaded: false,
};

function snap(overrides: Partial<SubmitNavigationSnapshot>): SubmitNavigationSnapshot {
    return {...BASE_SNAPSHOT, ...overrides};
}

describe('getSubmitHandler', () => {
    it('returns SEARCH_PRE_INSERT when pre-inserted but not report-pre-inserted', () => {
        expect(getSubmitHandler(snap({isPreInserted: true, isReportPreInserted: false}))).toBe(SUBMIT_HANDLER.SEARCH_PRE_INSERT);
    });

    it('returns REPORT_PRE_INSERT when report is pre-inserted', () => {
        expect(getSubmitHandler(snap({isPreInserted: true, isReportPreInserted: true}))).toBe(SUBMIT_HANDLER.REPORT_PRE_INSERT);
    });

    it('returns REPORT_PRE_INSERT even when isPreInserted is false (isReportPreInserted checked independently)', () => {
        expect(getSubmitHandler(snap({isPreInserted: false, isReportPreInserted: true}))).toBe(SUBMIT_HANDLER.REPORT_PRE_INSERT);
    });

    it('returns DISMISS_MODAL when dismiss fast path is eligible (report topmost split + loaded destination)', () => {
        expect(
            getSubmitHandler(
                snap({
                    isReportTopmostSplit: true,
                    destinationReportID: '123',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DISMISS_MODAL);
    });

    it('returns DISMISS_MODAL when search is topmost full screen (no destination needed)', () => {
        expect(
            getSubmitHandler(
                snap({
                    isSearchTopmostFullScreen: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DISMISS_MODAL);
    });

    it('returns REPORT_IN_RHP_DISMISS when report is in RHP with a destination', () => {
        expect(
            getSubmitHandler(
                snap({
                    isReportInRHP: true,
                    destinationReportID: '456',
                }),
            ),
        ).toBe(SUBMIT_HANDLER.REPORT_IN_RHP_DISMISS);
    });

    it('returns REPORT_IN_RHP_DISMISS for destination-report flows when report is in RHP', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    navigatesToDestinationReport: true,
                    isReportInRHP: true,
                    destinationReportID: '456',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.REPORT_IN_RHP_DISMISS);
    });

    it('falls through to DEFAULT when report is in RHP but no destinationReportID', () => {
        expect(
            getSubmitHandler(
                snap({
                    isReportInRHP: true,
                    destinationReportID: undefined,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DEFAULT);
    });

    it('returns SEARCH_DISMISS for global create with canDismissFromSearch and search on top', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    canDismissFromSearch: true,
                    isSearchTopmostFullScreen: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.SEARCH_DISMISS);
    });

    it('returns DISMISS_MODAL (not SEARCH_DISMISS) when global create + search on top + report topmost split (dismiss fast path takes priority)', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    canDismissFromSearch: true,
                    isSearchTopmostFullScreen: true,
                    isReportTopmostSplit: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DISMISS_MODAL);
    });

    it('returns DEFAULT when no conditions match', () => {
        expect(getSubmitHandler(BASE_SNAPSHOT)).toBe(SUBMIT_HANDLER.DEFAULT);
    });

    it('returns DEFAULT when global create without canDismissFromSearch', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    canDismissFromSearch: false,
                    isSearchTopmostFullScreen: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DEFAULT);
    });

    it('returns DISMISS_TO_REPORT for global create flows that dismiss to a loaded destination report', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    navigatesToDestinationReport: true,
                    destinationReportID: '456',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DISMISS_TO_REPORT);
    });

    it('returns DISMISS_MODAL for destination-report flows (e.g. SPLIT) from global create on Search/Spend (canDismissFromSearch is false for SPLIT)', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    canDismissFromSearch: false,
                    navigatesToDestinationReport: true,
                    isSearchTopmostFullScreen: true,
                    destinationReportID: '456',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DISMISS_MODAL);
    });

    it('returns DEFAULT for global create destination-report flows when destination report is not loaded', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    navigatesToDestinationReport: true,
                    destinationReportID: '456',
                    isDestinationReportLoaded: false,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DEFAULT);
    });

    it('returns SEARCH_DISMISS (not REPORT_IN_RHP_DISMISS) for global create from Search with report in RHP', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    canDismissFromSearch: true,
                    isSearchTopmostFullScreen: true,
                    isReportInRHP: true,
                    destinationReportID: '456',
                }),
            ),
        ).toBe(SUBMIT_HANDLER.SEARCH_DISMISS);
    });

    it('returns DEFAULT when destination report is set but not loaded', () => {
        expect(
            getSubmitHandler(
                snap({
                    destinationReportID: '789',
                    isDestinationReportLoaded: false,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DEFAULT);
    });

    it('pre-insert handlers take priority over dismiss modal fast path', () => {
        expect(
            getSubmitHandler(
                snap({
                    isPreInserted: true,
                    isReportPreInserted: false,
                    isSearchTopmostFullScreen: true,
                    destinationReportID: '123',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.SEARCH_PRE_INSERT);
    });

    it('pre-insert takes priority over DISMISS_TO_REPORT', () => {
        expect(
            getSubmitHandler(
                snap({
                    isPreInserted: true,
                    isReportPreInserted: false,
                    isFromGlobalCreate: true,
                    navigatesToDestinationReport: true,
                    destinationReportID: '456',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.SEARCH_PRE_INSERT);
    });

    it('DISMISS_MODAL fast path takes priority over DISMISS_TO_REPORT when report topmost split', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    navigatesToDestinationReport: true,
                    isReportTopmostSplit: true,
                    destinationReportID: '456',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DISMISS_MODAL);
    });

    it('SEARCH_DISMISS takes priority over DISMISS_TO_REPORT when canDismissFromSearch is true', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    canDismissFromSearch: true,
                    navigatesToDestinationReport: true,
                    isSearchTopmostFullScreen: true,
                    destinationReportID: '456',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.SEARCH_DISMISS);
    });

    it('returns DISMISS_TO_REPORT when canDismissFromSearch but Search is not topmost and destination is loaded', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    canDismissFromSearch: true,
                    navigatesToDestinationReport: true,
                    isSearchTopmostFullScreen: false,
                    destinationReportID: 'report-1',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DISMISS_TO_REPORT);
    });

    it('returns DISMISS_MODAL (via fast path) for navigatesToDestinationReport when not isFromGlobalCreate but destination is loaded', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: false,
                    navigatesToDestinationReport: true,
                    destinationReportID: '456',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DISMISS_MODAL);
    });

    it('returns DEFAULT for navigatesToDestinationReport without destinationReportID (non-search)', () => {
        expect(
            getSubmitHandler(
                snap({
                    isFromGlobalCreate: true,
                    navigatesToDestinationReport: true,
                    destinationReportID: undefined,
                    isDestinationReportLoaded: false,
                }),
            ),
        ).toBe(SUBMIT_HANDLER.DEFAULT);
    });
});

describe('canUseDismissModalFastPath', () => {
    it('returns false for global create without report topmost split', () => {
        expect(canUseDismissModalFastPath(snap({isFromGlobalCreate: true, isReportTopmostSplit: false}))).toBe(false);
    });

    it('returns false when report is in RHP', () => {
        expect(
            canUseDismissModalFastPath(
                snap({
                    isReportInRHP: true,
                    destinationReportID: '123',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(false);
    });

    it('returns false when no search on top and no destination report', () => {
        expect(canUseDismissModalFastPath(snap({isSearchTopmostFullScreen: false, destinationReportID: undefined}))).toBe(false);
    });

    it('returns false when destination report exists but is not loaded', () => {
        expect(canUseDismissModalFastPath(snap({destinationReportID: '123', isDestinationReportLoaded: false}))).toBe(false);
    });

    it('returns true when search is topmost full screen', () => {
        expect(canUseDismissModalFastPath(snap({isSearchTopmostFullScreen: true}))).toBe(true);
    });

    it('returns true for global create with report topmost split and loaded destination', () => {
        expect(
            canUseDismissModalFastPath(
                snap({
                    isFromGlobalCreate: true,
                    isReportTopmostSplit: true,
                    destinationReportID: '123',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(true);
    });

    it('returns true with destination report loaded and no global create', () => {
        expect(
            canUseDismissModalFastPath(
                snap({
                    destinationReportID: '123',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(true);
    });

    it('returns true for destination-report requests when other conditions are met', () => {
        expect(
            canUseDismissModalFastPath(
                snap({
                    navigatesToDestinationReport: true,
                    destinationReportID: '123',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(true);
    });
});
