import MenuItem from '@components/MenuItem';

import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';

import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useRef} from 'react';

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

function SettingsMenuItem({item, isFocused, keyTitle, isExecuting, isScreenFocused, onPress, wrapperStyle}: SettingsMenuItemProps) {
    const popoverAnchor = useRef(null);

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

    const hasTrailing = !!item.badgeText || !!item.brickRoadIndicator || !!item.iconRight;

    return (
        <MenuItem.Root
            ref={popoverAnchor}
            style={wrapperStyle}
            onPress={onPress}
            onSecondaryInteraction={onSecondaryInteraction}
            isDisabled={isExecuting}
            isActive={isFocused}
            role={CONST.ROLE.TAB}
            sentryLabel={item.sentryLabel}
        >
            <MenuItem.Row>
                <MenuItem.Icon
                    src={item.icon}
                    variant={CONST.MENU_ITEM.ICON_VARIANT.COMPACT}
                />
                <MenuItem.Content>
                    <MenuItem.Title>{keyTitle}</MenuItem.Title>
                </MenuItem.Content>
                {hasTrailing && (
                    <MenuItem.Trailing>
                        {!!item.badgeText && (
                            <MenuItem.Badge
                                text={item.badgeText}
                                success={item.isBadgeSuccess}
                                isCondensed={item.isBadgeCondensed}
                            />
                        )}
                        {!!item.brickRoadIndicator && <MenuItem.BrickRoadIndicator status={item.brickRoadIndicator} />}
                        {!!item.iconRight && <MenuItem.Chevron src={item.iconRight} />}
                    </MenuItem.Trailing>
                )}
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

SettingsMenuItem.displayName = 'SettingsMenuItem';

export default SettingsMenuItem;
