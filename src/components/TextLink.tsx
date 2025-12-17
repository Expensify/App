import type {KeyboardEvent, KeyboardEventHandler, MouseEventHandler} from 'react';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, StyleProp, TextStyle} from 'react-native';
import useEnvironment from '@hooks/useEnvironment';
import useThemeStyles from '@hooks/useThemeStyles';
import {openLink as openLinkUtil} from '@userActions/Link';
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

function TextLink({href, onPress, children, style, onMouseDown = (event) => event.preventDefault(), ref, ...rest}: TextLinkProps) {
    const {environmentURL} = useEnvironment();
    const styles = useThemeStyles();

    const openLink = (event: GestureResponderEvent | KeyboardEvent) => {
        if (onPress) {
            onPress(event);
        } else {
            openLinkUtil(href, environmentURL);
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

export type {LinkProps, PressProps, TextLinkProps};

export default TextLink;
