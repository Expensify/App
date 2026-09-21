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
        const {result, rerender} = renderHook(({offset, isLoading}) => useLiveRowLimit(offset, isLoading), {initialProps: {offset: PAGE, isLoading: true}});

        // offset is written when the request fires, so the pending page must not reveal early
        expect(result.current.liveRowLimit).toBe(PAGE);

        rerender({offset: PAGE, isLoading: false});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);
    });

    it('never lowers the cap when a refresh rewinds the cursor to 0', () => {
        const {result, rerender} = renderHook(({offset, isLoading}) => useLiveRowLimit(offset, isLoading), {initialProps: {offset: PAGE, isLoading: false}});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);

        // a first-page refresh resets offset, but those rows are still in Onyx
        rerender({offset: 0, isLoading: true});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);

        rerender({offset: 0, isLoading: false});

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
        const {result, rerender} = renderHook(({offset, isLoading}) => useLiveRowLimit(offset, isLoading), {initialProps: {offset: 0, isLoading: false}});

        act(() => {
            result.current.setRevealedLiveRows((rows) => rows + PAGE);
        });

        rerender({offset: 0, isLoading: false});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);
    });

    it('keeps a bumped reveal when the cursor later runs past it', () => {
        const {result, rerender} = renderHook(({offset, isLoading}) => useLiveRowLimit(offset, isLoading), {initialProps: {offset: 0, isLoading: false}});

        act(() => {
            result.current.setRevealedLiveRows((rows) => rows + PAGE);
        });

        // a page the server answered anyway moves the cursor past the reveal
        rerender({offset: PAGE, isLoading: false});

        expect(result.current.liveRowLimit).toBe(PAGE * 2);

        rerender({offset: PAGE * 2, isLoading: false});

        expect(result.current.liveRowLimit).toBe(PAGE * 3);
    });
});
