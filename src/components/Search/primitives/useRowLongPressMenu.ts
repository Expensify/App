import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchRowSelectionActions} from '@components/Search/SearchContext';
import type {SearchListItem, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import useMobileSelectionMenuModal from '@hooks/useMobileSelectionMenuModal';

import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';

import {useRoute} from '@react-navigation/native';

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
};

/**
 * Owns the row long-press affordance: in mobile selection mode a long press toggles the row, otherwise
 * it opens the global bottom-docked "select" menu, and picking it turns on selection mode for the pressed row.
 * Extracted from SearchList so ExpenseFlatSearchView can reuse it. Must be used inside
 * SearchWriteActionsProvider so `toggle` resolves to the real action rather than the no-op default.
 */
function useRowLongPressMenu({shouldPreventLongPressRow, isSmallScreenWidth, isMobileSelectionModeEnabled}: UseRowLongPressMenuParams): UseRowLongPressMenuResult {
    const {toggle} = useSearchRowSelectionActions();
    const route = useRoute();
    const {showMobileSelectionMenuModal} = useMobileSelectionMenuModal();

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

    const handleLongPressRow = (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => {
        const currentRoute = navigationRef.current?.getCurrentRoute();
        if (currentRoute && route.key !== currentRoute.key) {
            return;
        }

        if (shouldPreventLongPressRow || !isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox || item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        showMobileSelectionMenuModal({sentryLabel: CONST.SENTRY_LABEL.SEARCH.SELECTION_MODE_MENU_ITEM}).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            turnOnMobileSelectionMode();
            toggle(item, itemTransactions);
        });
    };

    const onLongPressRow = isMobileSelectionModeEnabled ? handleLongPressRowInMobileSelectionMode : handleLongPressRow;

    return {onLongPressRow};
}

export default useRowLongPressMenu;
