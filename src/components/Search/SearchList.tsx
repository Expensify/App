import {useIsFocused} from '@react-navigation/native';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import React, {type ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {type NativeScrollEvent, type NativeSyntheticEvent, View} from 'react-native';
import Animated from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import FlatList from '@components/FlatList';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ListItem, ReportActionListItemType, ReportListItemType, TransactionListItemType, ValidListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import CONST from '@src/CONST';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<SearchListItem>);

type SearchListItem = TransactionListItemType | ReportListItemType | ReportActionListItemType;

type SearchListProps = {
    data: SearchListItem[];

    /** Default renderer for every item in the list */
    ListItem: ValidListItem;

    SearchTableHeader?: React.JSX.Element;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: SearchListItem) => void;

    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: SearchListItem) => void;

    /** Callback to fire when "Select All" checkbox is pressed. Only use along with `canSelectMultiple` */
    onAllCheckboxPress?: () => void;

    /** Callback to fire when the list is scrolled */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

function SearchList({data, ListItem, onSelectRow, onCheckboxPress, canSelectMultiple, onScroll, onAllCheckboxPress, SearchTableHeader}: SearchListProps) {
    const styles = useThemeStyles();
    const selectedItemsLength = data.reduce((acc, item) => (item.isSelected ? acc + 1 : acc), 0);

    // _______________________________________ selection modal logic _______________________________________
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [longPressedItem, setLongPressedItem] = useState<SearchListItem>();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const isFocused = useIsFocused();

    const {selectionMode} = useMobileSelectionMode(true);
    // Check if selection should be on when the modal is opened
    const wasSelectionOnRef = useRef(false);
    // Keep track of the number of selected items to determine if we should turn off selection mode
    const selectionRef = useRef(0);

    useEffect(() => {
        selectionRef.current = selectedItemsLength;

        if (!isSmallScreenWidth) {
            if (selectedItemsLength === 0) {
                turnOffMobileSelectionMode();
            }
            return;
        }
        if (!isFocused) {
            return;
        }
        if (!wasSelectionOnRef.current && selectedItemsLength > 0) {
            wasSelectionOnRef.current = true;
        }
        if (selectedItemsLength > 0 && !selectionMode?.isEnabled) {
            turnOnMobileSelectionMode();
        } else if (selectedItemsLength === 0 && selectionMode?.isEnabled && !wasSelectionOnRef.current) {
            turnOffMobileSelectionMode();
        }
    }, [selectionMode, isSmallScreenWidth, isFocused, selectedItemsLength]);

    useEffect(
        () => () => {
            if (selectionRef.current !== 0) {
                return;
            }
            turnOffMobileSelectionMode();
        },
        [],
    );

    const handleLongPressRow = useCallback(
        (item: SearchListItem) => {
            console.log('%%%%%\n', 'i run!');
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (!isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox || !isFocused) {
                // TODO: check if it works I deleted some conditions
                return;
            }
            setLongPressedItem(item);
            setIsModalVisible(true);
        },
        [isFocused, isSmallScreenWidth],
    );

    const turnOnSelectionMode = () => {
        turnOnMobileSelectionMode();
        setIsModalVisible(false);

        if (onCheckboxPress && longPressedItem) {
            onCheckboxPress?.(longPressedItem);
        }
    };
    // _______________________________________ selection modal logic _______________________________________

    const renderItem = useCallback(
        (info: ListRenderItemInfo<SearchListItem>) => {
            return (
                <ListItem
                    showTooltip={false}
                    onSelectRow={onSelectRow}
                    onLongPressRow={handleLongPressRow}
                    onCheckboxPress={onCheckboxPress}
                    canSelectMultiple={canSelectMultiple}
                    item={info.item}
                />
            );
        },
        [ListItem, canSelectMultiple, handleLongPressRow, onCheckboxPress, onSelectRow],
    );

    return (
        <>
            {!!SearchTableHeader && (
                <View style={[styles.userSelectNone, styles.peopleRow, styles.ph5, styles.pb3, styles.ph8, styles.pt3, styles.selectionListStickyHeader]}>
                    <Checkbox
                        accessibilityLabel="TODO"
                        isChecked={false} // TODO
                        onPress={onAllCheckboxPress}
                        // disabled={flattenedSections.allOptions.length === flattenedSections.disabledOptionsIndexes.length}
                    />

                    {SearchTableHeader}
                </View>
            )}
            <AnimatedFlashList
                data={data}
                renderItem={renderItem}
                estimatedItemSize={108}
                onScroll={onScroll}
            />
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
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

export default SearchList;
