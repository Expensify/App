import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useRef, useState} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import SelectionList from '@components/SelectionList';
import type {BaseSelectionListProps, ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import CONST from '@src/CONST';

type SelectionListWithModalProps<TItem extends ListItem> = BaseSelectionListProps<TItem> & {
    turnOnSelectionModeOnLongPress?: boolean;
    onTurnOnSelectionMode?: (item: TItem | null) => void;
    shouldAutoTurnOff?: boolean;
    isSelected?: (item: TItem) => boolean;
};

function SelectionListWithModal<TItem extends ListItem>(
    {turnOnSelectionModeOnLongPress, onTurnOnSelectionMode, onLongPressRow, sections, shouldAutoTurnOff, isSelected, ...rest}: SelectionListWithModalProps<TItem>,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [longPressedItem, setLongPressedItem] = useState<TItem | null>(null);
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {selectionMode} = useMobileSelectionMode(shouldAutoTurnOff);
    // Check if selection should be on when the modal is opened
    const wasSelectionOnRef = useRef(false);
    // Keep track of the number of selected items to determine if we should turn off selection mode
    const selectionRef = useRef(0);

    useEffect(() => {
        // We can access 0 index safely as we are not displaying multiple sections in table view
        const selectedItems = sections[0].data.filter((item) => {
            if (isSelected) {
                return isSelected(item);
            }
            return !!item.isSelected;
        });
        selectionRef.current = selectedItems.length;

        if (!isSmallScreenWidth) {
            if (selectedItems.length === 0) {
                turnOffMobileSelectionMode();
            }
            return;
        }
        if (!wasSelectionOnRef.current && selectedItems.length > 0) {
            wasSelectionOnRef.current = true;
        }
        if (selectedItems.length > 0 && !selectionMode?.isEnabled) {
            turnOnMobileSelectionMode();
        } else if (selectedItems.length === 0 && selectionMode?.isEnabled && !wasSelectionOnRef.current) {
            turnOffMobileSelectionMode();
        }
    }, [sections, selectionMode, isSmallScreenWidth, isSelected]);

    useEffect(
        () => () => {
            if (selectionRef.current !== 0) {
                return;
            }
            turnOffMobileSelectionMode();
        },
        [],
    );

    const handleLongPressRow = (item: TItem) => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!turnOnSelectionModeOnLongPress || !isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox) {
            return;
        }
        setLongPressedItem(item);
        setIsModalVisible(true);

        if (onLongPressRow) {
            onLongPressRow(item);
        }
    };

    const turnOnSelectionMode = () => {
        turnOnMobileSelectionMode();
        setIsModalVisible(false);

        if (onTurnOnSelectionMode) {
            onTurnOnSelectionMode(longPressedItem);
        }
    };

    return (
        <>
            <SelectionList
                ref={ref}
                sections={sections}
                onLongPressRow={handleLongPressRow}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
            >
                <MenuItem
                    title={translate('common.select')}
                    icon={Expensicons.Checkmark}
                    onPress={turnOnSelectionMode}
                />
            </Modal>
        </>
    );
}

export default forwardRef(SelectionListWithModal);
