import React, {FC, ForwardedRef, KeyboardEventHandler, MouseEventHandler, ReactElement} from 'react';
import {GestureResponderEvent, Text as RNText, TextStyle} from 'react-native';
import styles from '@styles/styles';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import Text from './Text';

type TextLinkProps = {
    /** Link to open in new tab */
    href: string;

    /** Text content child */
    children: ReactElement;

    /** Additional style props */
    style?: TextStyle;

    /** Overwrites the default link behavior with a custom callback */
    onPress?: () => void;

    /** Callback that is called when mousedown is triggered */
    onMouseDown?: MouseEventHandler;

    /** A ref to forward to text */
    forwardedRef: ForwardedRef<RNText>;
};

function TextLink({href, children, style, onPress, onMouseDown = (event) => event.preventDefault(), forwardedRef, ...props}: TextLinkProps) {
    const openLink = () => {
        if (onPress) {
            onPress();
            return;
        }

        Link.openExternalLink(href);
    };

    const openLinkOnTap = (event: GestureResponderEvent) => {
        event.preventDefault();

        openLink();
    };

    const openLinkOnEnterKey: KeyboardEventHandler = (event) => {
        event.preventDefault();
        if (event.key !== 'Enter') {
            return;
        }

        openLink();
    };

    return (
        <Text
            style={[styles.link, style]}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
            href={href}
            onPress={openLinkOnTap}
            onKeyDown={openLinkOnEnterKey}
            onMouseDown={onMouseDown}
            ref={forwardedRef}
            suppressHighlighting
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </Text>
    );
}

TextLink.displayName = 'TextLink';

const TextLinkWithRef: FC<TextLinkProps> = React.forwardRef<RNText, TextLinkProps>((props, ref) => (
    <TextLink
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

TextLinkWithRef.displayName = 'TextLinkWithRef';

export default TextLinkWithRef;
