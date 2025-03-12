import React from 'react';
import {isMobileChrome} from '@libs/Browser';
import Clipboard from '@libs/Clipboard';
import Text from './Text';
import type {TextProps} from './Text';

type TextWithCopyProps = TextProps & {
    /** The value to copy when the text component is pressed */
    copyText: string;
};

/**
 * A text component that copies the text to the clipboard when pressed.
 * This is different from the `CopyTextToClipboard` component in that
 * here the copy functionality is incorporated into the text itself.
 */
function TextWithCopy({children, copyText, ...rest}: TextWithCopyProps) {
    return (
        <Text
            onPress={() => {
                Clipboard.setString(copyText);
            }}
            // Disable to prevent Chrome's Touch to Search popup showing up when text is selected
            selectable={!isMobileChrome()}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </Text>
    );
}

export default TextWithCopy;
