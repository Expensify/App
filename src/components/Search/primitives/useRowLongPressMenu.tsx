import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import {useSearchRowSelectionActions} from '@components/Search/SearchContext';
import type {SearchListItem, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';

import {useRoute} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';

type UseRowLongPressMenuParams = {
    /** Whether long press should be suppressed entirely. */
    shouldPreventLongPressRow?: boolean;

    /** Narrow-layout flag. Long press is a narrow-only affordance. Uses isSmallScreenWidth (not
     *  shouldUseNarrowLayout) to dodge the issue #48675 race, so the caller passes it through. */
    isSmallScreenWidth: boolean;

    /** When mobile selection mode is already on, a long press toggles the row directly instead of
     *  opening the "select" menu. */
    isMobileSelectionModeEnabled: boolean;
};

type UseRowLongPressMenuResult = {
    /** The resolved long-press handler to hand to each row (mobile-mode toggle vs open-menu). */
    onLongPressRow: (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => void;

    /** The bottom-docked "select" menu element. Render it as a sibling of the list. */
    modal: React.JSX.Element;
};

/**
 * Owns the row long-press affordance: in mobile selection mode a long press toggles the row, otherwise
 * it opens a bottom-docked menu whose single action turns on selection mode for the pressed row.
 * Extracted from SearchList so ExpenseFlatSearchView can reuse it. Must be used inside
 * SearchWriteActionsProvider so `toggle` resolves to the real action rather than the no-op default.
 */
function useRowLongPressMenu({shouldPreventLongPressRow, isSmallScreenWidth, isMobileSelectionModeEnabled}: UseRowLongPressMenuParams): UseRowLongPressMenuResult {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['CheckSquare']);
    const {toggle} = useSearchRowSelectionActions();
    const route = useRoute();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [longPressedItem, setLongPressedItem] = useState<SearchListItem>();
    const [longPressedItemTransactions, setLongPressedItemTransactions] = useState<TransactionListItemType[]>();

    const handleLongPressRowInMobileSelectionMode = (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => {
        const currentRoute = navigationRef.current?.getCurrentRoute();
        if (currentRoute && route.key !== currentRoute.key) {
            return;
        }

        if (shouldPreventLongPressRow || !isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox || item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        toggle(item, itemTransactions);
    };

    const handleLongPressRow = useCallback(
        (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => {
            const currentRoute = navigationRef.current?.getCurrentRoute();
            if (currentRoute && route.key !== currentRoute.key) {
                return;
            }

            if (shouldPreventLongPressRow || !isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox || item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            setLongPressedItem(item);
            setLongPressedItemTransactions(itemTransactions);
            setIsModalVisible(true);
        },
        [route.key, shouldPreventLongPressRow, isSmallScreenWidth],
    );

    const turnOnSelectionMode = useCallback(() => {
        turnOnMobileSelectionMode();
        setIsModalVisible(false);

        if (longPressedItem) {
            toggle(longPressedItem, longPressedItemTransactions);
        }
    }, [longPressedItem, toggle, longPressedItemTransactions]);

    const onLongPressRow = isMobileSelectionModeEnabled ? handleLongPressRowInMobileSelectionMode : handleLongPressRow;

    const modal = (
        <Modal
            isVisible={isModalVisible}
            type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            onClose={() => setIsModalVisible(false)}
            shouldPreventScrollOnFocus
        >
            <MenuItem
                title={translate('common.select')}
                icon={expensifyIcons.CheckSquare}
                onPress={turnOnSelectionMode}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SELECTION_MODE_MENU_ITEM}
            />
        </Modal>
    );

    return {onLongPressRow, modal};
}

export default useRowLongPressMenu;
