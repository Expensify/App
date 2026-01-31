import React from 'react';
import {View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

/**
 * Wrapper component that hides its children from screen readers when RHP (Right Hand Panel) is open.
 * This prevents screen reader virtual cursor from escaping the RHP modal to background content.
 */
function RHPAccessibilityWrapper({children}: ChildrenProps) {
    const styles = useThemeStyles();
    const [modal] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: true});

    const isRHPOpen = modal?.isVisible && modal?.type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED;

    return (
        <View
            style={styles.flex1}
            accessibilityElementsHidden={isRHPOpen}
            importantForAccessibility={isRHPOpen ? 'no-hide-descendants' : 'auto'}
        >
            {children}
        </View>
    );
}

export default RHPAccessibilityWrapper;
