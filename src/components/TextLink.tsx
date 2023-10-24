import _ from 'underscore';
import React, { ForwardedRef, MouseEventHandler, ReactElement } from 'react';
import Text from './Text';
import styles from '../styles/styles';
import CONST from '../CONST';
import * as Link from '../libs/actions/Link';
import { TextStyle, Text as RNText } from 'react-native';

type TextLinkProps = {
    /** Link to open in new tab */
    href: string;

    /** Text content child */
    children: ReactElement;

    /** Additional style props */
    style: TextStyle;

    /** Overwrites the default link behavior with a custom callback */
    onPress: () => void;

    /** Callback that is called when mousedown is triggered */
    onMouseDown: MouseEventHandler;

    /** A ref to forward to text */
    forwardedRef: ForwardedRef<RNText>,
}

function TextLink({href, children, style, onPress, onMouseDown = (event) => event.preventDefault(), forwardedRef, ...props}: TextLinkProps) {
    const openLink = (event: Event) => {
        event.preventDefault();
        if (onPress) {
            onPress();
            return;
        }

        Link.openExternalLink(href);
    };

    const openLinkIfEnterKeyPressed = (event: KeyboardEvent) => {
        if (event.key !== 'Enter') {
            return;
        }
        openLink(event);
    };

    return (
        <Text
            style={[styles.link, style]}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
            href={href}
            onPress={openLink}
            onMouseDown={onMouseDown}
            onKeyDown={openLinkIfEnterKeyPressed}
            ref={forwardedRef}
            suppressHighlighting
            {...props}
        >
            {/* {children} */}
        </Text>
    );
}

TextLink.displayName = 'TextLink';

export default React.forwardRef<RNText, TextLinkProps>((props, ref) => (
    <TextLink
        {...props}
        forwardedRef={ref}
    />
));
