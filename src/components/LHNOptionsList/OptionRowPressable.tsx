import type {ReactNode, RefObject} from 'react';
import React, {useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, View} from 'react-native';
import Hoverable from '@components/Hoverable';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DomUtils from '@libs/DomUtils';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';

type OptionRowPressableProps = {
    reportID: string;
    optionItem: OptionData;
    isOptionFocused: boolean;
    isScreenFocused: boolean;
    popoverAnchor: RefObject<View | null>;
    onPress: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;
    onLayout?: (event: LayoutChangeEvent) => void;
    accessibilityLabel: string;
    accessibilityHint?: string;
    testID?: string;
    children: (hovered: boolean) => ReactNode;
};

function OptionRowPressable({
    reportID,
    optionItem,
    isOptionFocused,
    isScreenFocused,
    popoverAnchor,
    onPress,
    onLayout,
    accessibilityLabel,
    accessibilityHint,
    testID,
    children,
}: OptionRowPressableProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isContextMenuActive, setIsContextMenuActive] = useState(false);

    const showPopover = (event: MouseEvent | GestureResponderEvent) => {
        if (!isScreenFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsContextMenuActive(true);
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT,
            event,
            selection: '',
            contextMenuAnchor: popoverAnchor.current,
            report: {
                reportID,
                originalReportID: reportID,
                isPinnedChat: optionItem.isPinned,
                isUnreadChat: !!optionItem.isUnread,
            },
            reportAction: {
                reportActionID: '-1',
            },
            callbacks: {
                onHide: () => setIsContextMenuActive(false),
            },
            withoutOverlay: false,
        });
    };

    return (
        <Hoverable>
            {(hovered) => (
                <PressableWithSecondaryInteraction
                    ref={popoverAnchor}
                    onPress={onPress}
                    onMouseDown={(event) => {
                        // Allow composer blur on right click
                        if (!event) {
                            return;
                        }
                        // Prevent composer blur on left click
                        event.preventDefault();
                    }}
                    testID={testID}
                    onSecondaryInteraction={(event) => {
                        showPopover(event);
                        // Ensure that we blur the composer when opening context menu, so that only one component is focused at a time
                        if (DomUtils.getActiveElement()) {
                            (DomUtils.getActiveElement() as HTMLElement | null)?.blur();
                        }
                    }}
                    withoutFocusOnSecondaryInteraction
                    activeOpacity={variables.pressDimValue}
                    opacityAnimationDuration={0}
                    style={[
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.justifyContentBetween,
                        styles.sidebarLink,
                        styles.sidebarLinkInnerLHN,
                        StyleUtils.getBackgroundColorStyle(theme.sidebar),
                        isOptionFocused ? styles.sidebarLinkActive : null,
                        (hovered || isContextMenuActive) && !isOptionFocused ? styles.sidebarLinkHover : null,
                    ]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={accessibilityLabel}
                    accessibilityHint={accessibilityHint}
                    onLayout={onLayout}
                    needsOffscreenAlphaCompositing={(optionItem?.icons?.length ?? 0) >= 2}
                    sentryLabel={CONST.SENTRY_LABEL.LHN.OPTION_ROW}
                >
                    {children(hovered)}
                </PressableWithSecondaryInteraction>
            )}
        </Hoverable>
    );
}

OptionRowPressable.displayName = 'OptionRowPressable';

export default OptionRowPressable;
