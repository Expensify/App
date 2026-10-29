import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useRef} from 'react';
import {View} from 'react-native';

import CreateMenuPopover from './FABPopoverContent/CreateMenuPopover';
import FABButtons from './FABPopoverContent/FABButtons';
import useCreateMenuVisibility from './FABPopoverContent/useCreateMenuVisibility';

/**
 * Responsible for rendering the {@link CreateMenuPopover}, and the accompanying
 * FAB that can open or close the menu.
 */
function FloatingActionButtonAndPopover() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isCreateMenuActive, isCreateMenuVisible, hideCreateMenu, toggleCreateMenu} = useCreateMenuVisibility();
    const fabRef = useRef<HTMLDivElement>(null);

    return (
        <View style={[styles.justifyContentCenter, styles.flexGrow1, styles.gap3, shouldUseNarrowLayout ? styles.w100 : styles.pv4]}>
            <CreateMenuPopover
                isVisible={isCreateMenuVisible}
                onClose={hideCreateMenu}
                anchorRef={fabRef}
            />
            <FABButtons
                isActive={isCreateMenuActive}
                fabRef={fabRef}
                onPress={() => toggleCreateMenu()}
            />
        </View>
    );
}

export default FloatingActionButtonAndPopover;
