import type {ForwardedRef, KeyboardEvent, KeyboardEventHandler, MouseEventHandler} from 'react';
import React, {forwardRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, StyleProp, TextStyle} from 'react-native';
import useEnvironment from '@hooks/useEnvironment';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type {TextProps} from './Text';
import Text from './Text';

type LinkProps = {
    /** Link to open in new tab */
    href: string;

    onPress?: undefined;
};

type PressProps = {
    href?: undefined;

    /** Overwrites the default link behavior with a custom callback */
    onPress: (event: GestureResponderEvent | KeyboardEvent) => void;
};

type TextLinkProps = (LinkProps | PressProps) &
    TextProps & {
        /** Additional style props */
        style?: StyleProp<TextStyle>;

        /** Callback that is called when mousedown is triggered */
        onMouseDown?: MouseEventHandler;
    };

function TextLink({href, onPress, children, style, onMouseDown = (event) => event.preventDefault(), ...rest}: TextLinkProps, ref: ForwardedRef<RNText>) {
    const {environmentURL} = useEnvironment();
    const styles = useThemeStyles();

    const openLink = (event: GestureResponderEvent | KeyboardEvent) => {
        if (onPress) {
            onPress(event);
        } else {
            Link.openLink(href, environmentURL);
        }
    };

    const openLinkOnTap = (event: GestureResponderEvent) => {
        event.preventDefault();

        openLink(event);
    };

    const openLinkOnEnterKey: KeyboardEventHandler = (event) => {
        if (event.key !== 'Enter') {
            return;
        }
        event.preventDefault();

        openLink(event);
    };

    return (
        <Text
            style={[styles.link, style]}
            role={CONST.ROLE.LINK}
            href={href}
            onPress={openLinkOnTap}
            onKeyDown={openLinkOnEnterKey}
            onMouseDown={onMouseDown}
            ref={ref}
            suppressHighlighting
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </Text>
    );
}

TextLink.displayName = 'TextLink';

export type {LinkProps, PressProps};

export default forwardRef(TextLink);
