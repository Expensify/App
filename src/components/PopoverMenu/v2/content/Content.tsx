import React from 'react';
import {useRootVisibility} from '@components/PopoverMenu/v2/root/RootContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSuppressSpaceScroll from '@hooks/useSuppressSpaceScroll';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseContent from './BaseContent';
import type {BasePopoverProps} from './BaseContent';
import useMaxHeightStyle from './useMaxHeightStyle';

type ContentProps = BasePopoverProps;

/** Popover surface for menus that fit; for unbounded row counts, use `<ScrollableContent>`. */
function Content({containerStyles, ...rest}: ContentProps): React.ReactElement | null {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isVisible} = useRootVisibility(Content.displayName);
    useSuppressSpaceScroll(isVisible);

    const maxHeightStyle = useMaxHeightStyle();

    return (
        <BaseContent
            {...rest}
            componentName={Content.displayName}
            maxHeightStyle={maxHeightStyle}
            containerStyles={[isSmallScreenWidth ? styles.pv4 : styles.pv2, containerStyles]}
        />
    );
}

Content.displayName = 'PopoverMenu.Content';

export default Content;
export type {ContentProps};
