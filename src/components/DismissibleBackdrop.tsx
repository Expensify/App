import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import CenteredModalLayoutOverlay from './CenteredModalLayoutOverlay';

type DismissibleBackdropProps = {
    /** Content laid out on top of the backdrop */
    children: React.ReactNode;

    /** Called when the backdrop is pressed and when Escape is pressed */
    onDismiss: () => void;

    /** Extra styles merged into the click-transparent area that holds the children */
    style?: StyleProp<ViewStyle>;
};

function DismissibleBackdrop({children, onDismiss, style}: DismissibleBackdropProps) {
    const styles = useThemeStyles();

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, onDismiss, {shouldBubble: false});

    return (
        <>
            <CenteredModalLayoutOverlay onBackdropPress={onDismiss} />
            {/* Without box-none this full-screen view swallows presses outside the content and onDismiss never fires. */}
            <View
                pointerEvents="box-none"
                style={[styles.flex1, style]}
            >
                {children}
            </View>
        </>
    );
}

export default DismissibleBackdrop;
