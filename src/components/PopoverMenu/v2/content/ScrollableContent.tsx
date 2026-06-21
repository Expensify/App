import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useRoot} from '@components/PopoverMenu/v2/root/RootContext';
import ScrollView from '@components/ScrollView';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {BasePopoverProps} from './BaseContent';
import ResponsiveShell from './ResponsiveShell';
import useContentController from './useContentController';
import useMaxHeightStyle from './useMaxHeightStyle';

type ScrollableContentProps = BasePopoverProps & {
    contentContainerStyle?: StyleProp<ViewStyle>;
};

const VIRTUALIZATION_RECOMMENDED_THRESHOLD = 50;

function ScrollableContent({contentContainerStyle, children, containerStyles, onExitComplete, testID, anchorAlignment}: ScrollableContentProps): React.ReactElement | null {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float on desktop, so device width drives the padding split.
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {state, meta} = useRoot(ScrollableContent.displayName);
    const {isOpen} = state;
    const {triggerID, contentID} = meta;
    if (__DEV__) {
        const childCount = React.Children.count(children);
        if (childCount > VIRTUALIZATION_RECOMMENDED_THRESHOLD) {
            Log.warn(
                `<PopoverMenu.ScrollableContent> received ${childCount} children — <ScrollableContent> renders all rows synchronously and will jank on lower-end devices for unbounded counts. Consider a virtualized list (FlashList) wrapper.`,
            );
        }
    }
    const {windowHeight} = useWindowDimensions();
    const maxHeightStyle = useMaxHeightStyle({
        desktopFallback: {maxHeight: Math.max(windowHeight - variables.compactPopoverMenuVerticalMargin, CONST.POPOVER_MENU_MAX_HEIGHT)},
    });
    const controller = useContentController(ScrollableContent.displayName);

    const scrolledChildren = <ScrollView contentContainerStyle={[isSmallScreenWidth ? styles.pv4 : styles.pv2, contentContainerStyle]}>{children}</ScrollView>;

    return (
        <ResponsiveShell
            componentName={ScrollableContent.displayName}
            controller={controller}
            isOpen={isOpen}
            triggerID={triggerID}
            contentID={contentID}
            anchorAlignment={anchorAlignment}
            maxHeightStyle={maxHeightStyle}
            containerStyles={containerStyles}
            onExitComplete={onExitComplete}
            testID={testID}
        >
            {scrolledChildren}
        </ResponsiveShell>
    );
}

ScrollableContent.displayName = 'PopoverMenu.ScrollableContent';

export default ScrollableContent;
export type {ScrollableContentProps};
