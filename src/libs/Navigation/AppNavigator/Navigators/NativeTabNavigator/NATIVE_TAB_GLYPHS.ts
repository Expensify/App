import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

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
 * Vector copies of the tab bar SVGs in `assets/images`, so Skia draws each glyph at the bar's size and the device's
 * density on both platforms. They have to be kept in sync with those files.
 */
const NATIVE_TAB_GLYPHS = {
    // home.svg
    [SCREENS.HOME]: {
        viewBoxSize: 20,
        paths: [
            {
                d: 'M9.386 1.477a1 1 0 0 1 1.229 0l7.613 5.922c.487.379.772.962.772 1.579V18a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v6H2a1 1 0 0 1-1-1V8.978c0-.617.285-1.2.772-1.579z',
            },
        ],
    },
    // inbox.svg
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: {
        viewBoxSize: 20,
        paths: [
            {
                d: 'M4.5 1.5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-11a3 3 0 0 0-3-3zm-1 3a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V12H13c-.276 0-.495.226-.549.497a2.5 2.5 0 0 1-4.902 0C7.494 12.226 7.276 12 7 12H3.5z',
                isEvenOdd: true,
            },
        ],
    },
    // receipt-multiple.svg
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: {
        viewBoxSize: 20,
        paths: [
            {
                d: 'M9.72 1.24c.12-.18.36-.21.52-.07l1.15 1c.16.14.41.1.52-.07l.54-.83a.35.35 0 0 1 .64.14l2.18 15.49c.04.32-.33.52-.58.31l-.75-.65a.35.35 0 0 0-.52.07l-.84 1.28c-.12.18-.36.21-.52.07l-1.16-1a.35.35 0 0 0-.52.07l-.84 1.28c-.12.18-.36.21-.52.07l-1.15-1a.35.35 0 0 0-.52.07l-.83 1.28c-.12.18-.36.21-.52.07l-1.16-1a.35.35 0 0 0-.52.07l-.54.83a.35.35 0 0 1-.64-.14L.97 3.11c-.04-.32.33-.52.58-.31l.75.65c.16.14.41.1.52-.07l.83-1.28c.12-.18.36-.21.52-.07l1.15 1c.16.14.41.1.52-.07l.83-1.28c.12-.18.36-.21.52-.07l1.15 1c.16.14.41.1.52-.07l.83-1.28Zm1.37 10.99-5.2.73a.87.87 0 0 0-.74.99c.07.48.51.81.99.75l5.2-.73c.48-.07.81-.51.75-.99a.886.886 0 0 0-.99-.75ZM8.87 9.01 5.4 9.5c-.48.07-.81.51-.75.99.07.48.51.81.99.75l3.47-.49c.48-.07.81-.51.75-.99a.87.87 0 0 0-.99-.74Zm1.24-3.71-5.2.73c-.48.07-.81.51-.75.99.07.48.51.81.99.75l5.2-.73a.87.87 0 0 0 .74-.99.886.886 0 0 0-.99-.75Z',
                isEvenOdd: true,
            },
            {
                d: 'M15.15 3.09c.1.16.32.19.46.07l1.03-.89c.14-.12.36-.09.46.06l.74 1.14c.1.16.32.19.46.07l.67-.58c.22-.19.55 0 .51.28l-1.94 13.79c-.04.28-.41.37-.57.13l-.49-.74s-.02-.03-.04-.04L14.42 2.03l.7 1.07Z',
            },
        ],
    },
    // pie-chart.svg
    [SCREENS.INSIGHTS]: {
        viewBoxSize: 24,
        paths: [
            {d: 'M15.598.074C14.94-.008 14.4.537 14.4 1.2v8.4h8.4c.663 0 1.208-.54 1.126-1.198A9.605 9.605 0 0 0 15.598.074'},
            {d: 'M22.734 13.198C22.138 18.6 17.56 22.8 12 22.8 6.035 22.8 1.2 17.965 1.2 12c0-5.56 4.2-10.138 9.602-10.734C11.46 1.193 12 1.737 12 2.4V12h9.6c.663 0 1.207.54 1.134 1.198'},
        ],
    },
    // buildings.svg
    [NAVIGATORS.WORKSPACE_NAVIGATOR]: {
        viewBoxSize: 20,
        paths: [
            {
                d: 'M1 3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8v-3a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v3H3a2 2 0 0 1-2-2zm2 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0m0 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0m1 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2m3-7a1 1 0 1 1 2 0 1 1 0 0 1-2 0m1 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-1 5a1 1 0 1 1 2 0 1 1 0 0 1-2 0m5-5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m3 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0m1 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-1 5a1 1 0 1 1 2 0 1 1 0 0 1-2 0m-3-5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-1 5a1 1 0 1 1 2 0 1 1 0 0 1-2 0',
                isEvenOdd: true,
            },
        ],
    },
    // profile.svg, with its circle written as a path
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: {
        viewBoxSize: 20,
        paths: [
            {d: 'M13 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'},
            {d: 'M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9m5.9 12.7C14.6 12.1 12.4 11 10 11s-4.6 1.1-5.9 2.7C3.4 12.6 3 11.4 3 10c0-3.9 3.1-7 7-7s7 3.1 7 7c0 1.4-.4 2.6-1.1 3.7'},
        ],
    },
} as const satisfies Record<string, NativeTabGlyph>;

/** A tab of the native tab bar, by its route name. */
type NativeTabName = keyof typeof NATIVE_TAB_GLYPHS;

export default NATIVE_TAB_GLYPHS;
export type {NativeTabGlyph, NativeTabName};
