import React from 'react';
import type {ViewStyle} from 'react-native';
import {useRootState} from '@components/PopoverMenu/v2/root/RootContext';
import type {AnchorRef} from '@components/PopoverMenu/v2/root/RootContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSuppressSpaceScroll from '@hooks/useSuppressSpaceScroll';
import CONST from '@src/CONST';
import BaseContent from './BaseContent';
import type {BasePopoverProps} from './BaseContent';

type ContentProps = BasePopoverProps & {
    /** Ignored in landscape so bottom-docked sheets stay reachable. */
    shouldEnableMaxHeight?: boolean;
};

/** Popover surface for menus that fit; for unbounded row counts, use `<ScrollableContent>`. */
function Content({shouldEnableMaxHeight = true, ...rest}: ContentProps): React.ReactElement | null {
    const {
        state: {isVisible},
    } = useRootState(Content.displayName);
    // ScrollableContent skips this — the user opts into space scrolling the inner content.
    useSuppressSpaceScroll(isVisible);

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const maxHeightStyle = computeMaxHeightStyle({shouldEnableMaxHeight, isSmallScreenWidth, isInLandscapeMode});

    return (
        <BaseContent
            // eslint-disable-next-line react/jsx-props-no-spreading -- forwards BasePopoverProps through to BaseContent
            {...rest}
            maxHeightStyle={maxHeightStyle}
        />
    );
}

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
