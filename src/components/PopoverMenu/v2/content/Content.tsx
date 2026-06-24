import React from 'react';
import {useRoot} from '@components/PopoverMenu/v2/root/RootContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSuppressSpaceScroll from '@hooks/useSuppressSpaceScroll';
import useThemeStyles from '@hooks/useThemeStyles';
import type {BasePopoverProps} from './BaseContent';
import ResponsiveShell from './ResponsiveShell';
import useContentController from './useContentController';
import useMaxHeightStyle from './useMaxHeightStyle';

type ContentProps = BasePopoverProps;

function Content({containerStyles, onExitComplete, testID, anchorAlignment, children}: ContentProps): React.ReactElement | null {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float on desktop, so device width drives the padding split.
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {state, meta} = useRoot(Content.displayName);
    const {isOpen} = state;
    const {triggerID, contentID} = meta;
    useSuppressSpaceScroll(isOpen);

    const maxHeightStyle = useMaxHeightStyle();
    const controller = useContentController(Content.displayName);
    const padding = isSmallScreenWidth ? styles.pv4 : styles.pv2;

    return (
        <ResponsiveShell
            componentName={Content.displayName}
            controller={controller}
            isOpen={isOpen}
            triggerID={triggerID}
            contentID={contentID}
            anchorAlignment={anchorAlignment}
            maxHeightStyle={maxHeightStyle}
            containerStyles={[padding, containerStyles]}
            onExitComplete={onExitComplete}
            testID={testID}
        >
            {children}
        </ResponsiveShell>
    );
}

Content.displayName = 'PopoverMenu.Content';

export default Content;
export type {ContentProps};
