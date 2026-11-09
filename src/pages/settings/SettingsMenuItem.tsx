import MenuItem from '@components/MenuItem';
import type {FlatNavSidebarRowProps} from '@components/Navigation/FlatNavigationBar/useFlatNavSidebarRowProps';

import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';

import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useRef} from 'react';

import type {MenuData} from './useInitialSettingsPageMenuData';

type SettingsMenuItemProps = {
    item: MenuData;
    isFocused: boolean;
    keyTitle: string | undefined;
    isExecuting: boolean;
    isScreenFocused: boolean;
    onPress: () => void;
    wrapperStyle: StyleProp<ViewStyle>;

    /** Overrides that give the row the flat navigation bar's look, empty when the bar is not shown */
    flatNavRowProps: FlatNavSidebarRowProps;
};

function SettingsMenuItem({item, isFocused, keyTitle, isExecuting, isScreenFocused, onPress, wrapperStyle, flatNavRowProps}: SettingsMenuItemProps) {
    const popoverAnchor = useRef(null);
    const {shouldShowBasicTitle, titleStyle, hoveredTitleStyle, selectedStyle, hoveredStyle} = flatNavRowProps;

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
        <MenuItem
            wrapperStyle={[wrapperStyle, selectedStyle]}
            hoveredStyle={hoveredStyle}
            shouldShowBasicTitle={shouldShowBasicTitle}
            titleStyle={titleStyle}
            hoveredTitleStyle={hoveredTitleStyle}
            title={keyTitle}
            icon={item.icon}
            iconType={item.iconType}
            disabled={isExecuting && !isFocused}
            onPress={onPress}
            iconStyles={item.iconStyles}
            badgeText={item.badgeText}
            badgeStyle={item.badgeStyle}
            isBadgeSuccess={item.isBadgeSuccess}
            isBadgeStrong={item.isBadgeStrong}
            isBadgeCondensed={item.isBadgeCondensed}
            fallbackIcon={item.fallbackIcon}
            brickRoadIndicator={item.brickRoadIndicator}
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
            shouldGreyOutWhenDisabled={false}
        />
    );
}

SettingsMenuItem.displayName = 'SettingsMenuItem';

export default SettingsMenuItem;
