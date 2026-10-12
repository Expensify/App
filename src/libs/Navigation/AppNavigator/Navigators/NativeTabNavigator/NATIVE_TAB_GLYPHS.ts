import type {ValueOf} from 'type-fest';

type NativeTabGlyphPath = {
    d: string;
    isEvenOdd?: boolean;
};

type NativeTabGlyph = {
    /** Side of the square viewBox the paths are drawn in. */
    viewBoxSize: number;
    paths: NativeTabGlyphPath[];
};

/**
 * What a native tab bar item stands for. An item is drawn by its kind rather than by its route, because the Spend
 * route takes the Expenses, Reports or More slot depending on the search it shows.
 */
const NATIVE_TAB_ITEM_KINDS = {
    HOME: 'home',
    INBOX: 'inbox',
    EXPENSES: 'expenses',
    REPORTS: 'reports',
    MORE: 'more',
} as const;

type NativeTabItemKind = ValueOf<typeof NATIVE_TAB_ITEM_KINDS>;

/**
 * Vector copies of the tab bar SVGs in `assets/images`, so Skia draws each glyph at the bar's size and the device's
 * density on both platforms. They have to be kept in sync with those files.
 */
const NATIVE_TAB_GLYPHS = {
    // home.svg
    [NATIVE_TAB_ITEM_KINDS.HOME]: {
        viewBoxSize: 20,
        paths: [
            {
                d: 'M9.386 1.477a1 1 0 0 1 1.229 0l7.613 5.922c.487.379.772.962.772 1.579V18a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v6H2a1 1 0 0 1-1-1V8.978c0-.617.285-1.2.772-1.579z',
            },
        ],
    },
    // inbox.svg
    [NATIVE_TAB_ITEM_KINDS.INBOX]: {
        viewBoxSize: 20,
        paths: [
            {
                d: 'M4.5 1.5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-11a3 3 0 0 0-3-3zm-1 3a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V12H13c-.276 0-.495.226-.549.497a2.5 2.5 0 0 1-4.902 0C7.494 12.226 7.276 12 7 12H3.5z',
                isEvenOdd: true,
            },
        ],
    },
    // receipt.svg
    [NATIVE_TAB_ITEM_KINDS.EXPENSES]: {
        viewBoxSize: 20,
        paths: [
            {
                d: 'M3 1.1V19c0 .4.5.5.7.3l.7-.9q.3-.3.6 0l1.1 1.3q.3.3.6 0l1.1-1.3q.3-.3.6 0l1.1 1.3q.3.3.6 0l1.1-1.3q.3-.3.6 0l1.1 1.3q.3.3.6 0l1.1-1.3q.3-.3.6 0l.7.9c.2.3.7.1.7-.3V1.1c0-.4-.5-.5-.7-.3l-.7.9q-.3.3-.6 0L13.5.4q-.3-.3-.6 0L12 1.7q-.3.3-.6 0L10.3.4q-.3-.3-.6 0L8.5 1.7q-.3.3-.6 0L6.8.3q-.3-.3-.6 0L5 1.7q-.3.3-.6 0L3.7.8C3.5.5 3 .7 3 1.1M7 5c-.6 0-1 .4-1 1s.4 1 1 1h6c.6 0 1-.4 1-1s-.4-1-1-1zm0 4c-.6 0-1 .4-1 1s.4 1 1 1h4c.6 0 1-.4 1-1s-.4-1-1-1zm-1 5c0-.6.4-1 1-1h6c.6 0 1 .4 1 1s-.4 1-1 1H7c-.6 0-1-.4-1-1',
                isEvenOdd: true,
            },
        ],
    },
    // document.svg
    [NATIVE_TAB_ITEM_KINDS.REPORTS]: {
        viewBoxSize: 20,
        paths: [{d: 'M17.5 7h-6a.5.5 0 0 1-.5-.5v-6a.5.5 0 0 0-.5-.5H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5a.5.5 0 0 0-.5-.5'}, {d: 'M13.5 5H18l-5-5v4.5a.5.5 0 0 0 .5.5'}],
    },
    // three-dots.svg
    [NATIVE_TAB_ITEM_KINDS.MORE]: {
        viewBoxSize: 20,
        paths: [
            {
                d: 'M12.5 3c0 1.4-1.1 2.5-2.5 2.5S7.5 4.4 7.5 3 8.6.5 10 .5s2.5 1.1 2.5 2.5m0 7c0 1.4-1.1 2.5-2.5 2.5S7.5 11.4 7.5 10 8.6 7.5 10 7.5s2.5 1.1 2.5 2.5M10 19.5c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5-2.5 1.1-2.5 2.5 1.1 2.5 2.5 2.5',
            },
        ],
    },
} as const satisfies Record<NativeTabItemKind, NativeTabGlyph>;

export default NATIVE_TAB_GLYPHS;
export {NATIVE_TAB_ITEM_KINDS};
export type {NativeTabGlyph, NativeTabItemKind};
