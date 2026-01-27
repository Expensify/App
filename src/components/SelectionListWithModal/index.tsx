import {useIsFocused} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useEffect, useMemo, useState} from 'react';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import SelectionList from '@components/SelectionList';
import type {ListItem, SelectionListHandle, SelectionListProps} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useHandleSelectionMode from '@hooks/useHandleSelectionMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import CONST from '@src/CONST';

type SelectionListWithModalProps<TItem extends ListItem> = SelectionListProps<TItem> & {
    turnOnSelectionModeOnLongPress?: boolean;
    onTurnOnSelectionMode?: (item: TItem | null) => void;
    ref?: ForwardedRef<SelectionListHandle<TItem>>;
};

function SelectionListWithModal<TItem extends ListItem>({
    turnOnSelectionModeOnLongPress,
    onTurnOnSelectionMode,
    onLongPressRow,
    data,
    isSelected,
    selectedItems: selectedItemsProp,
    ref,
    ...rest
}: SelectionListWithModalProps<TItem>) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [longPressedItem, setLongPressedItem] = useState<TItem | null>(null);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const icons = useMemoizedLazyExpensifyIcons(['CheckSquare'] as const);

    // Filter out the pending delete item when online to prevent making multiple updates to debouncedData which causes the deleted item is shown again
    const filteredData = useMemo(() => {
        return data.filter((item) => item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);
    }, [data, isOffline]);

    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    // Debounce the data prop to prevent rapid updates that cause FlashList layout errors
    // This gives FlashList time to properly update its layout cache when searching/filtering
    const [, debouncedData, setDataState] = useDebouncedState<TItem[]>(filteredData, CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);

    // Determine if this is changed by filtering (to limit multiple rerenders)
    const isFiltering = filteredData.length < debouncedData.length;

    useEffect(() => {
        setDataState(filteredData);
    }, [filteredData, setDataState]);

    const displayData = isFiltering ? debouncedData : filteredData;

    const selectedItems = useMemo(
        () =>
            selectedItemsProp ??
            displayData.filter((item) => {
                if (isSelected) {
                    return isSelected(item);
                }
                return !!item.isSelected;
            }) ??
            [],
        [isSelected, displayData, selectedItemsProp],
    );

    useHandleSelectionMode(selectedItems);

    const handleLongPressRow = (item: TItem) => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!turnOnSelectionModeOnLongPress || !isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox || !isFocused) {
            return;
        }
        if (isSmallScreenWidth && isMobileSelectionModeEnabled) {
            rest?.onCheckboxPress?.(item);
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
                data={displayData}
                addBottomSafeAreaPadding
                selectedItems={selectedItemsProp}
                onLongPressRow={handleLongPressRow}
                isSmallScreenWidth={isSmallScreenWidth}
                disableMaintainingScrollPosition
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
            >
                <MenuItem
                    title={translate('common.select')}
                    icon={icons.CheckSquare}
                    onPress={turnOnSelectionMode}
                    pressableTestID={CONST.SELECTION_LIST_WITH_MODAL_TEST_ID}
                />
            </Modal>
        </>
    );
}

export type {SelectionListWithModalProps};
export default SelectionListWithModal;
