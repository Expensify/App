import React, {useRef} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import PressableWithSecondaryInteraction from './PressableWithSecondaryInteraction';
import Text from './Text';
import type {TextProps} from './Text';

type TextWithCopyProps = TextProps & {
    /** The value to copy when the text component is pressed */
    copyValue: string;
};

/**
 * A text component that copies the text to the clipboard when pressed.
 * This is different from the `copyValueToClipboard` component in that
 * here the copy functionality is incorporated into the text itself.
 * Long press this text to toggle the context menu containing the copy option.
 */
function TextWithCopy({children, copyValue, ...rest}: TextWithCopyProps) {
    const popoverAnchor = useRef<View>(null);
    const styles = useThemeStyles();

    const showCopyContextMenu = (event: GestureResponderEvent | MouseEvent) => {
        if (!copyValue) {
            return;
        }
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.TEXT,
            event,
            selection: copyValue,
            contextMenuAnchor: popoverAnchor.current,
        });
    };

    return (
        <PressableWithSecondaryInteraction
            ref={popoverAnchor}
            onSecondaryInteraction={showCopyContextMenu}
            accessibilityLabel={copyValue}
            accessible
            style={styles.cursorDefault}
        >
            <Text
                selectable={false}
                numberOfLines={1}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            >
                {children}
            </Text>
        </PressableWithSecondaryInteraction>
    );
}

export default TextWithCopy;
