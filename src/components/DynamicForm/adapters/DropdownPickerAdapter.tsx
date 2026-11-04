import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import type {ValuePickerItem, ValuePickerProps} from '@components/ValuePicker/types';
import ValueSelectionList from '@components/ValuePicker/ValueSelectionList';

import usePopoverPosition from '@hooks/usePopoverPosition';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

/** Form adapter for a select field drawn as a field row whose options open in a pop-over anchored under it */
type DropdownPickerAdapterProps = Pick<
    ValuePickerProps,
    'value' | 'label' | 'modalHeaderTitle' | 'items' | 'errorText' | 'onInputChange' | 'shouldReadErrorWithLabel' | 'forwardedFSClass' | 'ref'
>;

type PopoverAnchor = {
    position: {horizontal: number; vertical: number};
    width: number;
};

/** A field row whose options open in a pop-over under it, as the category and tag pickers do, instead of on a page of their own */
function DropdownPickerAdapter({
    value,
    label = '',
    modalHeaderTitle,
    items = [],
    errorText = '',
    onInputChange,
    shouldReadErrorWithLabel,
    forwardedFSClass,
    ref,
}: DropdownPickerAdapterProps) {
    const anchorRef = useRef<ComponentRef<typeof View>>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [anchor, setAnchor] = useState<PopoverAnchor>({position: {horizontal: 0, vertical: 0}, width: CONST.POPOVER_DROPDOWN_WIDTH});
    const {calculatePopoverPosition} = usePopoverPosition();
    const selectedItem = items.find((item) => item.value === value);

    const open = () => {
        calculatePopoverPosition(anchorRef, {horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}).then(
            ({horizontal, vertical, width}) => {
                // usePopoverPosition measures nothing on a narrow layout, where the list opens as a bottom sheet at the default width
                setAnchor({position: {horizontal, vertical}, width: width || CONST.POPOVER_DROPDOWN_WIDTH});
                setIsOpen(true);
            },
        );
    };

    const select = (item: ValuePickerItem) => {
        if (item.value !== value) {
            onInputChange?.(item.value);
        }
        setIsOpen(false);
    };

    return (
        <View
            ref={anchorRef}
            fsClass={forwardedFSClass}
        >
            <MenuItem.Root
                ref={ref}
                onPress={open}
                accessibilityLabel={[label, selectedItem?.label].filter(Boolean).join(', ')}
                accessibilityState={{expanded: isOpen}}
            >
                <MenuItemField.Row
                    name={label}
                    value={selectedItem?.label}
                >
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    <MenuItem.DownCaret />
                </MenuItemField.Row>
                {!!errorText && (
                    <MenuItem.HelpText
                        isError
                        message={errorText}
                        shouldReadErrorWithLabel={shouldReadErrorWithLabel}
                    />
                )}
            </MenuItem.Root>
            <AnchoredSelectionListPopover
                isVisible={isOpen}
                onClose={() => setIsOpen(false)}
                anchorPosition={anchor.position}
                popoverWidth={anchor.width}
                optionCount={items.length}
                isSearchable={items.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
                title={modalHeaderTitle ?? label}
                backButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM_DROPDOWN.BACK_BUTTON}
                shouldFitContentHeight
            >
                <ValueSelectionList
                    items={items}
                    selectedItem={selectedItem}
                    isVisible={isOpen}
                    onItemSelected={select}
                    addBottomSafeAreaPadding={false}
                />
            </AnchoredSelectionListPopover>
        </View>
    );
}

export default DropdownPickerAdapter;
