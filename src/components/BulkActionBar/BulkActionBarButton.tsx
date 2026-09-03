import Button from '@components/ButtonComposed';
import PopoverMenu from '@components/PopoverMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import usePopoverPosition from '@hooks/usePopoverPosition';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';

import type {View} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';

import type {BulkActionBarButtonProps} from './types';

import {defaultPopoverAnchorPosition, SUB_MENU_ANCHOR_ALIGNMENT} from './popoverPosition';

/**
 * A single action in the bulk action bar. An action that carries `subMenuItems` renders a dropdown caret and opens
 * those items in a menu above itself; every other action runs `onSelected` directly.
 */
function BulkActionBarButton<TValueType>({option, onSubItemSelected}: BulkActionBarButtonProps<TValueType>) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);
    const {calculatePopoverPosition} = usePopoverPosition();

    const anchorRef = useRef<View | null>(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition | null>(defaultPopoverAnchorPosition);

    const subMenuItems = option.subMenuItems;
    const hasSubMenu = !!subMenuItems?.length;

    useEffect(() => {
        if (!anchorRef.current || !isMenuVisible) {
            return;
        }

        calculatePopoverPosition(anchorRef, SUB_MENU_ANCHOR_ALIGNMENT).then(setAnchorPosition);
    }, [isMenuVisible, calculatePopoverPosition]);

    return (
        <>
            <Button
                ref={anchorRef}
                onPress={() => {
                    if (hasSubMenu) {
                        setIsMenuVisible((isVisible) => !isVisible);
                        return;
                    }

                    option.onSelected?.();
                }}
                isDisabled={option.disabled}
                accessibilityLabel={option.text}
                sentryLabel={option.sentryLabel}
            >
                {!!option.icon && <Button.Icon src={option.icon} />}
                <Button.Text>{option.text}</Button.Text>
                {hasSubMenu && <Button.Icon src={isMenuVisible ? icons.UpArrow : icons.DownArrow} />}
            </Button>
            {hasSubMenu && !!anchorPosition && (
                <PopoverMenu
                    isVisible={isMenuVisible}
                    anchorRef={anchorRef}
                    anchorPosition={anchorPosition}
                    anchorAlignment={SUB_MENU_ANCHOR_ALIGNMENT}
                    menuItems={subMenuItems.map((subItem) => ({...subItem, shouldCallAfterModalHide: true}))}
                    onClose={() => setIsMenuVisible(false)}
                    onItemSelected={(selectedSubItem, index, event) => {
                        onSubItemSelected?.(selectedSubItem, index, event);
                        if (selectedSubItem.shouldCloseModalOnSelect === false) {
                            return;
                        }
                        setIsMenuVisible(false);
                    }}
                    shouldUseScrollView={subMenuItems.length >= CONST.DROPDOWN_SCROLL_THRESHOLD}
                />
            )}
        </>
    );
}

BulkActionBarButton.displayName = 'BulkActionBarButton';

export default BulkActionBarButton;
