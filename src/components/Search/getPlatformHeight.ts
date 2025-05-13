import {Platform} from 'react-native';
import getPlatform from '@libs/getPlatform';
import variables from '@styles/variables';

type PlatformHeights = Record<string, number | undefined>;

const ITEM_HEIGHTS = {
    MOBILE: {
        TRANSACTION: variables.listItemHeightNormal + variables.optionRowListItemPadding,
        WITH_BUTTON: variables.listItemHeightNormal + 12 + variables.optionRowListItemPadding,
        STANDARD: variables.listItemHeightNormal + variables.optionRowListItemPadding,
    },
    WEB: {
        WITH_BUTTON: variables.listItemHeightNormal + 12 + variables.optionRowListItemPadding,
        STANDARD: variables.listItemHeightNormal + variables.optionRowListItemPadding,
        COMPACT: variables.optionRowHeightCompact + variables.optionRowListItemPadding,
    },
    HEADER: variables.optionsListSectionHeaderHeight,
};

/**
 * Get platform-specific height based on provided heights object.
 *
 * @param heights - Object containing heights for different platforms (ios, android, web, mobileweb, desktop, default).
 * @param fallbackHeight - A default height to return if no matching platform height is found.
 * @returns The appropriate height for the current platform.
 */
function getPlatformHeight(heights: PlatformHeights, fallbackHeight: number): number {
    const currentPlatform = getPlatform();
    const height = heights[currentPlatform] ?? fallbackHeight;
    return Math.max(height, 1);
}

export default getPlatformHeight;
export {ITEM_HEIGHTS};
