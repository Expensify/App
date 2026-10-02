type ScrollToIndexOptions = {
    /** Is user editing message */
    isEditing?: boolean;

    animated?: boolean;

    /** Position of the target item relative to the viewport (0 = top, 0.5 = center, 1 = bottom) */
    viewPosition?: number;

    /** Additional offset to apply after viewPosition calculation */
    viewOffset?: number;
};

type ReportScrollManagerData = {
    /**
     * Scroll to a list index. `isEditing` suppresses the scroll (web only, defaults to `false`).
     * Omitting `animated` keeps each platform's default: web animates, native jumps.
     */
    scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
    scrollToBottom: () => void;
    scrollToEnd: () => void;
    scrollToOffset: (offset: number) => void;
};

export type {ScrollToIndexOptions, ReportScrollManagerData};
