import React, {forwardRef, useEffect, useState} from 'react';
import type {ForwardedRef} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import SelectionList from '@components/SelectionList';
import type {BaseSelectionListProps, ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import CONST from '@src/CONST';

type SelectionListWithModalProps<TItem extends ListItem> = BaseSelectionListProps<TItem> & {
    turnOnSelectionModeOnLongPress?: boolean;
    onTurnOnSelectionMode?: (item: TItem | null) => void;
};

function SelectionListWithModal<TItem extends ListItem>(
    {turnOnSelectionModeOnLongPress, onTurnOnSelectionMode, onLongPressRow, ...rest}: SelectionListWithModalProps<TItem>,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [longPressedItem, setLongPressedItem] = useState<TItem | null>(null);
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const handleLongPressRow = (item: TItem) => {
        if (!turnOnSelectionModeOnLongPress || !isSmallScreenWidth) {
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

    useEffect(() => turnOffMobileSelectionMode(), []);

    return (
        <>
            <SelectionList
                ref={ref}
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
