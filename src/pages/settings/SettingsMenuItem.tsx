import React, {useRef} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import MenuItem from '@components/MenuItem';
import {collapseProgress, peekProgress} from '@components/Navigation/SidebarCollapseStore';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {MenuData} from './InitialSettingsPage';

type SettingsMenuItemProps = {
    item: MenuData;
    isFocused: boolean;
    keyTitle: string | undefined;
    isExecuting: boolean;
    isScreenFocused: boolean;
    onPress: () => void;
    wrapperStyle: StyleProp<ViewStyle>;
};

// The inner MenuItem's natural width when fully expanded (sidebar 280 minus section mh3 = 256).
// We render it at this fixed width inside the animated wrapper so the MenuItem's internal layout
// doesn't reflow as the wrapper shrinks — instead, overflow: 'hidden' clips it.
const MENU_ITEM_INNER_WIDTH = variables.sideBarWithLHBWidth - 24;

// Visible width of the menu item row when fully collapsed. 52 = 16 (paddingHorizontal) + 20
// (icon) + 16 (paddingHorizontal) — symmetric icon centering inside the row, so combined with
// the section's mh3 (12) on each side, the active background sits with 12px of breathing room
// on both left and right of the 76px collapsed sidebar.
const MENU_ITEM_COLLAPSED_WIDTH = 52;

function SettingsMenuItem({item, isFocused, keyTitle, isExecuting, isScreenFocused, onPress, wrapperStyle}: SettingsMenuItemProps) {
    const popoverAnchor = useRef(null);

    // Shrink the menu item row's width in lockstep with the sidebar collapse animation.
    // overflow: 'hidden' on the wrapper clips the inner MenuItem (kept at its natural
    // MENU_ITEM_INNER_WIDTH so its layout doesn't reflow) — labels, chevrons, badges get
    // clipped past the icon column. Smooth fade-in/out on peek, matching Spend.
    const wrapperAnimatedStyle = useAnimatedStyle(() => {
        const cp = collapseProgress.get();
        const pp = peekProgress.get();
        const visualExpansion = 1 - cp * (1 - pp);
        return {
            width: MENU_ITEM_COLLAPSED_WIDTH + (MENU_ITEM_INNER_WIDTH - MENU_ITEM_COLLAPSED_WIDTH) * visualExpansion,
        };
    });

    // Fade + slide the title text in lockstep with the rest of the sidebar labels.
    // Applied via MenuItem's titleAnimatedStyle prop which wraps the title in an Animated.View
    // — required because reanimated can't animate styles on a plain Text component.
    const titleAnimatedStyle = useAnimatedStyle(() => {
        const cp = collapseProgress.get();
        const pp = peekProgress.get();
        const visualExpansion = 1 - cp * (1 - pp);
        return {
            opacity: visualExpansion,
            transform: [{translateX: -8 * (1 - visualExpansion)}],
        };
    });

    const onSecondaryInteraction = item.link
        ? (event: GestureResponderEvent | MouseEvent) => {
              if (!isScreenFocused) {
                  return;
              }
              const {link} = item;
              if (typeof link === 'function') {
                  link()?.then((url) =>
                      showContextMenu({
                          type: CONST.CONTEXT_MENU_TYPES.LINK,
                          event,
                          selection: url,
                          contextMenuAnchor: popoverAnchor.current,
                      }),
                  );
              } else if (link) {
                  showContextMenu({
                      type: CONST.CONTEXT_MENU_TYPES.LINK,
                      event,
                      selection: link,
                      contextMenuAnchor: popoverAnchor.current,
                  });
              }
          }
        : undefined;

    return (
        // alignSelf: 'flex-start' so the wrapper actually takes its animated width instead
        // of getting stretched to the section's full width by the parent flex column.
        // borderRadius: 8 so the focused / hovered background inside MenuItem gets clipped
        // with rounded corners instead of a hard cutoff on the right edge.
        <Animated.View style={[{overflow: 'hidden', alignSelf: 'flex-start', borderRadius: 8}, wrapperAnimatedStyle]}>
            <View style={{width: MENU_ITEM_INNER_WIDTH}}>
                <MenuItem
                    wrapperStyle={wrapperStyle}
                    title={keyTitle}
                    titleAnimatedStyle={titleAnimatedStyle}
                    icon={item.icon}
                    iconType={item.iconType}
                    disabled={isExecuting}
                    onPress={onPress}
                    iconStyles={item.iconStyles}
                    badgeText={item.badgeText}
                    badgeStyle={item.badgeStyle}
                    isBadgeSuccess={item.isBadgeSuccess}
                    isBadgeStrong={item.isBadgeStrong}
                    isBadgeCondensed={item.isBadgeCondensed}
                    fallbackIcon={item.fallbackIcon}
                    brickRoadIndicator={item.brickRoadIndicator}
                    shouldStackHorizontally={item.shouldStackHorizontally}
                    ref={popoverAnchor}
                    shouldBlockSelection={!!item.link}
                    onSecondaryInteraction={onSecondaryInteraction}
                    shouldShowContextMenuHint={!!item.link}
                    focused={isFocused}
                    role={CONST.ROLE.TAB}
                    isPaneMenu
                    sentryLabel={item.sentryLabel}
                    iconRight={item.iconRight}
                    shouldShowRightIcon={item.shouldShowRightIcon}
                    shouldIconUseAutoWidthStyle
                />
            </View>
        </Animated.View>
    );
}

SettingsMenuItem.displayName = 'SettingsMenuItem';

export default SettingsMenuItem;
