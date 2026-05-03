import React from 'react';
import type {ViewStyle} from 'react-native';
import {useRootState} from '@components/PopoverMenu/v2/root/RootContext';
import type {AnchorRef} from '@components/PopoverMenu/v2/root/RootContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSuppressSpaceScroll from '@hooks/useSuppressSpaceScroll';
import CONST from '@src/CONST';
import BaseContent from './BaseContent';
import type {BasePopoverProps} from './BaseContent';

/**
 * Renders the popover-menu surface anchored to the current anchor. Children render directly
 * inside the surface — for menus tall enough to need an inner scroll region, use
 * `<ScrollableContent>` instead.
 */
type ContentProps = BasePopoverProps & {
    /** Cap popover height. Ignored in landscape so content stays reachable. */
    shouldEnableMaxHeight?: boolean;
};

function Content({shouldEnableMaxHeight = true, ...rest}: ContentProps): React.ReactElement | null {
    const {
        state: {isVisible},
    } = useRootState(Content.displayName);
    // Stop space-bar from scrolling the page behind the popover. The scrollable variant skips this
    // because the user is opting into "space scrolls the inner content".
    useSuppressSpaceScroll(isVisible);

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const maxHeightStyle = computeMaxHeightStyle({shouldEnableMaxHeight, isSmallScreenWidth, isInLandscapeMode});

    return (
        <BaseContent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            maxHeightStyle={maxHeightStyle}
        />
    );
}

/**
 * Non-scrollable content shrinks to fit its children, capping only on small screens so the
 * menu never overflows the device viewport. Landscape opts out entirely so bottom-docked
 * sheets stay reachable.
 */
function computeMaxHeightStyle({
    shouldEnableMaxHeight,
    isSmallScreenWidth,
    isInLandscapeMode,
}: {
    shouldEnableMaxHeight: boolean;
    isSmallScreenWidth: boolean;
    isInLandscapeMode: boolean;
}): ViewStyle | undefined {
    if (!shouldEnableMaxHeight || isInLandscapeMode) {
        return undefined;
    }
    if (isSmallScreenWidth) {
        return {maxHeight: CONST.POPOVER_MENU_MAX_HEIGHT_MOBILE};
    }
    return undefined;
}

Content.displayName = 'PopoverMenu.Content';

export default Content;
export type {ContentProps};
export type {AnchorRef};
