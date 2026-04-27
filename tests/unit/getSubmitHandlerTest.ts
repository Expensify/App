import type {SubmitNavigationSnapshot} from '@pages/iou/request/step/confirmation/getSubmitHandler';
import {canUseDismissModalFastPath, getSubmitHandler, SUBMIT_HANDLER} from '@pages/iou/request/step/confirmation/getSubmitHandler';

const BASE_SNAPSHOT: SubmitNavigationSnapshot = {
    isPreInserted: false,
    isReportPreInserted: false,
    isFromGlobalCreate: false,
    canDismissFromSearch: false,
    isSplitRequest: false,
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

    it('returns false for split requests even when other conditions are met', () => {
        expect(
            canUseDismissModalFastPath(
                snap({
                    isSplitRequest: true,
                    destinationReportID: '123',
                    isDestinationReportLoaded: true,
                }),
            ),
        ).toBe(false);
    });
});
