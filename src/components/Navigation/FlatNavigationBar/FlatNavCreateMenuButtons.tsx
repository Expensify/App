import useThemeStyles from '@hooks/useThemeStyles';

import CreateMenuPopover from '@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover';
import FABButtons from '@pages/inbox/sidebar/FABPopoverContent/FABButtons';
import useCreateMenuVisibility from '@pages/inbox/sidebar/FABPopoverContent/useCreateMenuVisibility';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import React, {useRef} from 'react';
import {View} from 'react-native';

const CREATE_MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

// The buttons are centred in the header, so the menu opens a spacing step below their bottom edge, flush with the rows' inset.
const CREATE_MENU_ANCHOR_POSITION: AnchorPosition = {
    horizontal: variables.flatNavigationBarRowInset,
    vertical: (variables.flatNavigationBarHeaderHeight + variables.componentSizeNormal) / 2 + variables.spacing2,
};

/** The receipt and create buttons in the flat navigation bar's header, with the create menu opening just below the buttons. */
function FlatNavCreateMenuButtons() {
    const styles = useThemeStyles();
    const {isCreateMenuActive, isCreateMenuVisible, hideCreateMenu, toggleCreateMenu} = useCreateMenuVisibility();
    const fabRef = useRef<HTMLDivElement>(null);

    // The receipt button keeps its 4px side padding, so a 4px gap leaves 8px between the edges of the two buttons.
    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <CreateMenuPopover
                isVisible={isCreateMenuVisible}
                onClose={hideCreateMenu}
                anchorRef={fabRef}
                anchorPosition={CREATE_MENU_ANCHOR_POSITION}
                anchorAlignment={CREATE_MENU_ANCHOR_ALIGNMENT}
            />
            <FABButtons
                isActive={isCreateMenuActive}
                fabRef={fabRef}
                onPress={toggleCreateMenu}
            />
        </View>
    );
}

export default FlatNavCreateMenuButtons;
