/** The create menu behind the flat navigation bar's Create buttons, opening right below the button that toggles it. */
import usePopoverPosition from '@hooks/usePopoverPosition';

import useCreateMenuVisibility from '@pages/inbox/sidebar/FABPopoverContent/useCreateMenuVisibility';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {View} from 'react-native';

import {useRef, useState} from 'react';

const CREATE_MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function useFlatNavCreateMenu() {
    const {calculatePopoverPosition} = usePopoverPosition();
    const {isCreateMenuActive, isCreateMenuVisible, showCreateMenu, hideCreateMenu} = useCreateMenuVisibility();
    const buttonRef = useRef<View>(null);
    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>();

    // The hook's toggle would show the menu before the button is measured, at a stale position.
    const toggleCreateMenu = () => {
        if (isCreateMenuActive) {
            hideCreateMenu();
            return;
        }
        calculatePopoverPosition(buttonRef, CREATE_MENU_ANCHOR_ALIGNMENT).then(({horizontal, vertical}) => {
            setAnchorPosition({horizontal, vertical});
            showCreateMenu();
        });
    };

    return {
        buttonRef,
        isCreateMenuActive,
        toggleCreateMenu,
        menuProps: {
            isVisible: isCreateMenuVisible,
            onClose: hideCreateMenu,
            anchorRef: buttonRef,
            anchorPosition,
            anchorAlignment: CREATE_MENU_ANCHOR_ALIGNMENT,
        },
    };
}

export default useFlatNavCreateMenu;
