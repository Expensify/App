import variables from '@styles/variables';

const ITEM_HEIGHTS = {
    // Constants for wide screen layout
    WIDE: {
        STANDARD: variables.optionRowWideItemHeight + variables.optionRowListItemPadding,
    },

    // Constants for narrow screen with drawer
    NARROW_WITH_DRAWER: {
        STANDARD: variables.optionRowNarrowWithDrawerItemHeight + variables.optionRowListItemPadding,
        WITH_BUTTON: variables.optionRowNarrowWithDrawerItemHeightWithButton + variables.optionRowListItemPadding,
    },

    // Constants for narrow screen without drawer (mobile-like)
    NARROW_WITHOUT_DRAWER: {
        STANDARD: variables.optionRowNarrowWithoutDrawerItemHeight + variables.optionRowListItemPadding,
        WITH_BUTTON: variables.optionRowNarrowWithoutDrawerItemHeightWithButton + variables.optionRowListItemPadding,
    },

    HEADER: variables.optionRowSearchHeaderHeight,
} as const;

export default ITEM_HEIGHTS;
