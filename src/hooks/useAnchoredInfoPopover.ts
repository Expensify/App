/**
 * Positioning for an info popover that docks the same way as the workspace card label.
 * The 3px offset keeps the popover from covering the icon that opened it.
 */
import getClickedTargetLocation from '@libs/getClickedTargetLocation';

import {useEffect, useRef, useState} from 'react';

import useBottomSafeSafeAreaPaddingStyle from './useBottomSafeSafeAreaPaddingStyle';
import useResponsiveLayout from './useResponsiveLayout';
import useThemeStyles from './useThemeStyles';
import useWindowDimensions from './useWindowDimensions';

const ANCHOR_OFFSET = 3;

function useAnchoredInfoPopover(isVisible: boolean) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match Popover's dock decision (bottom-docked only when isSmallScreenWidth)
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const contentPaddingStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: isSmallScreenWidth,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        style: [styles.p4, styles.pb4],
    });
    const [anchorPosition, setAnchorPosition] = useState({top: 0, left: 0});
    const anchorRef = useRef(null);

    useEffect(() => {
        if (!anchorRef.current || !isVisible) {
            return;
        }

        const position = getClickedTargetLocation(anchorRef.current);
        setAnchorPosition({
            top: position.top + position.height + ANCHOR_OFFSET,
            left: position.left,
        });
    }, [isVisible, windowWidth]);

    return {
        anchorRef,
        anchorPosition,
        contentPaddingStyle,
        outerStyle: !shouldUseNarrowLayout ? styles.pr5 : undefined,
        innerContainerStyle: !shouldUseNarrowLayout ? styles.cardLabelTooltipContainer : undefined,
    };
}

export default useAnchoredInfoPopover;
