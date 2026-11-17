import {act, renderHook} from '@testing-library/react-native';

import useLiveRowLimit from '@components/Search/hooks/useLiveRowLimit';

import CONST from '@src/CONST';

const PAGE: number = CONST.SEARCH.RESULTS_PAGE_SIZE;

describe('useLiveRowLimit', () => {
    it('starts a fresh mount at one page', () => {
        // <Search> is keyed by hash, so a new query must not inherit the old cap
        const {result} = renderHook(() => useLiveRowLimit(0, false));

        expect(result.current.liveRowLimit).toBe(PAGE);
    });

    it('holds the cap at the cursor while a page is in flight, then releases it', () => {
        const {result, rerender} = renderHook(({offset, hasUnconfirmedPage}) => useLiveRowLimit(offset, hasUnconfirmedPage), {initialProps: {offset: PAGE, hasUnconfirmedPage: true}});

        // offset is written when the request fires, so the pending page must not reveal early
        expect(result.current.liveRowLimit).toBe(PAGE);

        rerender({offset: PAGE, hasUnconfirmedPage: false});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);
    });

    it('never lowers the cap when a refresh rewinds the cursor to 0', () => {
        const {result, rerender} = renderHook(({offset, hasUnconfirmedPage}) => useLiveRowLimit(offset, hasUnconfirmedPage), {initialProps: {offset: PAGE, hasUnconfirmedPage: false}});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);

        // a first-page refresh resets offset, but those rows are still in Onyx
        rerender({offset: 0, hasUnconfirmedPage: true});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);

        rerender({offset: 0, hasUnconfirmedPage: false});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);
    });

    it('floors at one page while the very first request is in flight', () => {
        const {result} = renderHook(() => useLiveRowLimit(0, true));

        expect(result.current.liveRowLimit).toBe(PAGE);
    });

    it('treats a missing cursor as offset 0', () => {
        const {result} = renderHook(() => useLiveRowLimit(undefined, undefined));

        expect(result.current.liveRowLimit).toBe(PAGE);
    });

    it('raises the cap by one page when the reveal is bumped past the cursor', () => {
        // the server is out of pages, so <Search> pages the live rows in itself
        const {result, rerender} = renderHook(({offset, hasUnconfirmedPage}) => useLiveRowLimit(offset, hasUnconfirmedPage), {initialProps: {offset: 0, hasUnconfirmedPage: false}});

        act(() => {
            result.current.revealNextPage();
        });

        rerender({offset: 0, hasUnconfirmedPage: false});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);
    });

    it('keeps a bumped reveal when the cursor later runs past it', () => {
        const {result, rerender} = renderHook(({offset, hasUnconfirmedPage}) => useLiveRowLimit(offset, hasUnconfirmedPage), {initialProps: {offset: 0, hasUnconfirmedPage: false}});

        act(() => {
            result.current.revealNextPage();
        });

        // a page the server answered anyway moves the cursor past the reveal
        rerender({offset: PAGE, hasUnconfirmedPage: false});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);

        rerender({offset: PAGE * 2, hasUnconfirmedPage: false});

        expect(result.current.liveRowLimit).toBe(PAGE * 3);
    });

    it('keeps the answered offset when a refresh rewinds the cursor, so paging resumes after the rows on screen', () => {
        // Given a tab whose third page already answered
        const {result, rerender} = renderHook(({offset, hasUnconfirmedPage}) => useLiveRowLimit(offset, hasUnconfirmedPage), {
            initialProps: {offset: PAGE * 2, hasUnconfirmedPage: false},
        });
        expect(result.current.answeredOffset).toBe(PAGE * 2);

        // When a first-page refresh rewinds the snapshot offset and then answers
        rerender({offset: 0, hasUnconfirmedPage: true});
        rerender({offset: 0, hasUnconfirmedPage: false});

        // Then the answered offset stays put, because those pages' rows are still in Onyx and asking for them again adds nothing
        expect(result.current.answeredOffset).toBe(PAGE * 2);
    });

    it('does not count a page as answered while it is running or after it failed', () => {
        // Given a page on the wire, since search() writes its offset before the response
        const {result, rerender} = renderHook(({offset, hasUnconfirmedPage}) => useLiveRowLimit(offset, hasUnconfirmedPage), {
            initialProps: {offset: PAGE, hasUnconfirmedPage: true},
        });

        // Then only the page before it counts as answered
        expect(result.current.answeredOffset).toBe(0);

        // When it fails, which parks the offset on the page it never delivered
        rerender({offset: PAGE, hasUnconfirmedPage: true});

        // Then it still doesn't count, so the next request retries it
        expect(result.current.answeredOffset).toBe(0);

        // When it answers
        rerender({offset: PAGE, hasUnconfirmedPage: false});

        // Then it counts
        expect(result.current.answeredOffset).toBe(PAGE);
    });
});
