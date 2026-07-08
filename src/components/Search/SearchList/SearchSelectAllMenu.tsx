import Checkbox from '@components/Checkbox';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {View} from 'react-native';

import React, {useCallback, useMemo, useRef, useState} from 'react';

type SearchSelectAllMenuProps = {
    isSelectAllChecked: boolean | undefined;
    isIndeterminate: boolean;
    selectedItemsLength: number;
    totalItems: number;
    shouldShowTextButton: boolean;
    onAllCheckboxPress: () => void;
};

function SearchSelectAllMenu({isSelectAllChecked, isIndeterminate, selectedItemsLength, totalItems, shouldShowTextButton, onAllCheckboxPress}: SearchSelectAllMenuProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Checkmark', 'CheckSquare']);
    const {currentSearchResults} = useSearchResultsContext();
    const {clearSelectedTransactions, selectAllMatchingItems} = useSearchSelectionActions();
    const selectAllAnchorRef = useRef<View>(null);
    const [isSelectAllMenuVisible, setIsSelectAllMenuVisible] = useState(false);
    const [selectAllMenuPosition, setSelectAllMenuPosition] = useState({horizontal: 0, vertical: 0});
    const {calculatePopoverPosition} = usePopoverPosition();

    const shouldOpenSelectAllMenu = selectedItemsLength === 0 && !!currentSearchResults?.search?.hasMoreResults;

    const closeSelectAllMenu = useCallback(() => setIsSelectAllMenuVisible(false), []);

    const selectAllOnPage = useCallback(() => {
        closeSelectAllMenu();
        onAllCheckboxPress();
    }, [closeSelectAllMenu, onAllCheckboxPress]);

    const selectAllMatching = useCallback(() => {
        closeSelectAllMenu();
        clearSelectedTransactions(undefined, true);
        selectAllMatchingItems(true);
    }, [clearSelectedTransactions, closeSelectAllMenu, selectAllMatchingItems]);

    const selectAllMenuItems = useMemo(
        (): PopoverMenuItem[] => [
            {icon: expensifyIcons.Checkmark, text: translate('search.exportAll.selectAllOnThisPage'), onSelected: selectAllOnPage},
            {icon: expensifyIcons.CheckSquare, text: translate('workspace.people.selectAll'), onSelected: selectAllMatching},
        ],
        [expensifyIcons.CheckSquare, expensifyIcons.Checkmark, selectAllMatching, selectAllOnPage, translate],
    );

    const showSelectAllMenu = useCallback(() => {
        if (!selectAllAnchorRef.current) {
            return;
        }

        calculatePopoverPosition(selectAllAnchorRef, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        }).then((position) => {
            setSelectAllMenuPosition(position);
            setIsSelectAllMenuVisible(true);
        });
    }, [calculatePopoverPosition]);

    const handleSelectAllPress = useCallback(() => {
        if (shouldOpenSelectAllMenu) {
            showSelectAllMenu();
            return;
        }

        onAllCheckboxPress();
    }, [onAllCheckboxPress, shouldOpenSelectAllMenu, showSelectAllMenu]);

    return (
        <>
            <PopoverMenu
                isVisible={isSelectAllMenuVisible}
                onClose={closeSelectAllMenu}
                onItemSelected={closeSelectAllMenu}
                menuItems={selectAllMenuItems}
                anchorRef={selectAllAnchorRef}
                anchorPosition={selectAllMenuPosition}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
            />
            <Checkbox
                ref={selectAllAnchorRef}
                accessibilityLabel={translate('accessibilityHints.selectAllItems')}
                isChecked={isSelectAllChecked}
                isIndeterminate={isIndeterminate}
                onPress={handleSelectAllPress}
                disabled={totalItems === 0}
                containerStyle={styles.m0}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SELECT_ALL_CHECKBOX}
            />
            {shouldShowTextButton && (
                <PressableWithFeedback
                    style={[styles.userSelectNone, styles.alignItemsCenter]}
                    onPress={handleSelectAllPress}
                    accessibilityLabel={translate('accessibilityHints.selectAllItems')}
                    role="button"
                    accessibilityState={{checked: isSelectAllChecked}}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.SELECT_ALL_BUTTON}
                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                >
                    <Text style={[styles.textMicroSupporting, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                </PressableWithFeedback>
            )}
        </>
    );
}

SearchSelectAllMenu.displayName = 'SearchSelectAllMenu';

export default SearchSelectAllMenu;
