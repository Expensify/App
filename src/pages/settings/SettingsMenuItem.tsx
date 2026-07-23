import MenuItem from '@components/MenuItem/compound';
import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';

import useLocalize from '@hooks/useLocalize';

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
    const {translate} = useLocalize();
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

    const combinedAccessibilityLabel = [keyTitle, item.brickRoadIndicator ? translate('common.yourReviewIsRequired') : ''].filter(Boolean).join('. ');
    const contextMenuHint = item.link ? getContextMenuAccessibilityHint({translate}) : undefined;
    const {accessibilityLabel, accessibilityHint} = getContextMenuAccessibilityProps({accessibilityLabel: combinedAccessibilityLabel, contextMenuHint});

    const hasTrailing = !!item.badgeText || !!item.brickRoadIndicator || !!item.iconRight;

    return (
        <MenuItem
            ref={popoverAnchor}
            style={wrapperStyle}
            onPress={onPress}
            onSecondaryInteraction={onSecondaryInteraction}
            disabled={isExecuting}
            focused={isFocused}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
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
        </MenuItem>
    );
}

SettingsMenuItem.displayName = 'SettingsMenuItem';

export default SettingsMenuItem;
