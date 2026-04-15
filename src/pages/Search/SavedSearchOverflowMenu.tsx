import React, {useState} from 'react';
import type {View} from 'react-native';
import type BaseModalProps from '@components/Modal/types';
import PopoverMenu from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import {getOverflowMenu} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SaveSearch} from '@src/types/onyx';
import {useSavedSearchTitleData} from './SavedSearchTitleContext';

type SavedSearchOverflowMenuProps = {
    savedSearchToModifyKey: string | null;
    savedSearches: SaveSearch | undefined;
    expensifyIcons: Parameters<typeof getOverflowMenu>[0];
    showDeleteModal: (hash: number) => void;
    menuAnchorRef: React.RefObject<View | null>;
    onSetModifyKey: (key: string | null) => void;
};

/**
 * Lazy overflow menu for saved search tabs. Consumes context only here so rename pre-fill
 * uses the resolved human-readable title.
 */
function SavedSearchOverflowMenu({savedSearchToModifyKey, savedSearches, expensifyIcons, showDeleteModal, menuAnchorRef, onSetModifyKey}: SavedSearchOverflowMenuProps) {
    const {translate} = useLocalize();
    const {resolveTitle} = useSavedSearchTitleData();
    const [restoreFocusType, setRestoreFocusType] = useState<BaseModalProps['restoreFocusType']>();

    const savedSearchToModify = savedSearchToModifyKey ? savedSearches?.[Number(savedSearchToModifyKey)] : undefined;
    const overflowMenuTitle = savedSearchToModify && savedSearchToModify.name === savedSearchToModify.query ? resolveTitle(savedSearchToModify.query) : (savedSearchToModify?.name ?? '');
    const popoverMenuItems = savedSearchToModify
        ? getOverflowMenu(expensifyIcons, overflowMenuTitle, Number(savedSearchToModifyKey), savedSearchToModify.query, translate, showDeleteModal, true, () => onSetModifyKey(null))
        : [];
    const shouldShowSavedSearchPopover = savedSearchToModifyKey && popoverMenuItems.length > 0;

    return (
        <PopoverMenu
            onClose={() => onSetModifyKey(null)}
            onModalHide={() => setRestoreFocusType(undefined)}
            isVisible={!!shouldShowSavedSearchPopover}
            // This component is only displayed when isSmallScreenWidth is true, so
            // anchorPosition is ignored anyway
            anchorPosition={{horizontal: 0, vertical: 0}}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
            onItemSelected={() => {
                setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);
                onSetModifyKey(null);
            }}
            menuItems={popoverMenuItems}
            anchorRef={menuAnchorRef}
            shouldEnableNewFocusManagement
            restoreFocusType={restoreFocusType}
        />
    );
}

export default SavedSearchOverflowMenu;
