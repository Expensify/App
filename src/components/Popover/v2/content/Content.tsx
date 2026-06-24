import React, {useEffect, useId} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import FloatingHost, {DEFAULT_FADE_DURATION_MS} from '@components/Overlay/FloatingHost';
import useHeadingState from '@components/Overlay/hooks/useHeadingState';
import {usePopover} from '@components/Popover/v2/root/state';
import type {PopoverContentRole} from '@components/Popover/v2/root/state';
import useThemeStyles from '@hooks/useThemeStyles';
import {PopoverContentStateContext} from './Headings';
import {DEFAULT_OFFSET_PX, DEFAULT_PLACEMENT, placementToAlignment} from './placement';
import type {PopoverPlacement} from './placement';

type ContentProps = {
    placement?: PopoverPlacement;
    style?: StyleProp<ViewStyle>;
    fadeDuration?: number;
    role?: PopoverContentRole;
    accessibilityLabel?: string;
    onExitComplete?: () => void;
    children: ReactNode;
};

function Content({placement, style, fadeDuration, role, accessibilityLabel, onExitComplete, children}: ContentProps) {
    const styles = useThemeStyles();
    const {state, actions, meta} = usePopover('<Popover.Content>');
    const {isOpen, anchor, anchorRect} = state;
    const {close, setContentRole} = actions;
    const {contentID} = meta;
    const stackId = useId();
    const contentState = useHeadingState();
    const {titleId, descriptionId, hasTitle, hasDescription} = contentState;
    const resolvedLabelledBy = hasTitle ? titleId : undefined;
    const resolvedDescribedBy = hasDescription ? descriptionId : undefined;
    const resolvedAccessibilityLabel = hasTitle ? undefined : accessibilityLabel;

    const resolvedRole = role ?? 'region';
    const alignment = placementToAlignment(placement ?? DEFAULT_PLACEMENT);

    useEffect(() => {
        setContentRole(resolvedRole);
        return () => setContentRole(null);
    }, [resolvedRole, setContentRole]);
    const containFocus = resolvedRole === 'dialog' || resolvedRole === 'menu';

    return (
        <FloatingHost
            isOpen={isOpen}
            anchor={anchor}
            anchorRect={anchorRect}
            alignment={alignment}
            offsetPx={DEFAULT_OFFSET_PX}
            fadeDuration={fadeDuration}
            onDismiss={close}
            onExitComplete={onExitComplete}
            surfaceStyle={[style, styles.popoverSurface]}
            stackId={stackId}
            containFocus={containFocus}
        >
            <PopoverContentStateContext value={contentState}>
                <View
                    role={resolvedRole}
                    nativeID={contentID}
                    accessibilityLabel={resolvedAccessibilityLabel}
                    accessibilityLabelledBy={resolvedLabelledBy}
                    accessibilityDescribedBy={resolvedDescribedBy}
                >
                    {children}
                </View>
            </PopoverContentStateContext>
        </FloatingHost>
    );
}

export default Content;
export {DEFAULT_FADE_DURATION_MS};
export type {ContentProps as PopoverContentProps};
