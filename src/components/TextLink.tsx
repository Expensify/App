import React, {ForwardedRef, forwardRef, KeyboardEventHandler, MouseEventHandler, ReactElement} from 'react';
import {GestureResponderEvent, Text as RNText, TextStyle} from 'react-native';
import styles from '@styles/styles';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import Text from './Text';

type TextLinkProps = {
    /** Link to open in new tab */
    href?: string;

    /** Text content child */
    children: ReactElement;

    /** Additional style props */
    style?: TextStyle;

    /** Overwrites the default link behavior with a custom callback */
    onPress?: () => void;

    /** Callback that is called when mousedown is triggered */
    onMouseDown?: MouseEventHandler;
};

function TextLink({href, children, style, onPress, onMouseDown = (event) => event.preventDefault(), ...props}: TextLinkProps, ref: ForwardedRef<RNText>) {
    const openLink = () => {
        if (onPress) {
            onPress();
        } else if (href) {
            Link.openExternalLink(href);
        }
    };

    const openLinkOnTap = (event: GestureResponderEvent) => {
        event.preventDefault();

        openLink();
    };

    const openLinkOnEnterKey: KeyboardEventHandler = (event) => {
        if (event.key !== 'Enter') {
            return;
        }
        event.preventDefault();

        openLink();
    };

    return (
        <Text
            style={[styles.link, style]}
            role={CONST.ACCESSIBILITY_ROLE.LINK}
            href={href}
            onPress={openLinkOnTap}
            onKeyDown={openLinkOnEnterKey}
            onMouseDown={onMouseDown}
            ref={ref}
            suppressHighlighting
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </Text>
    );
}

TextLink.displayName = 'TextLink';

export default forwardRef(TextLink);
