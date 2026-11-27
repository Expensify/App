import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import LoadingIndicator from '@components/LoadingIndicator';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type MultifactorAuthenticationAuthorizeTransactionActionsProps = {
    /** Replaces the buttons with a spinner while an answer is being sent */
    isLoading: boolean | undefined;

    /** Lays out the buttons, e.g. side by side or stacked */
    style?: StyleProp<ViewStyle>;

    children: ReactNode;
};

type ActionButtonProps = {
    text: string;
    onPress: () => void;
    sentryLabel: SentryLabel;
    style?: StyleProp<ViewStyle>;
};

/** Footer of the transaction review screens, each screen passes its own buttons and arranges them */
function MultifactorAuthenticationAuthorizeTransactionActions({isLoading, style, children}: MultifactorAuthenticationAuthorizeTransactionActionsProps) {
    const styles = useThemeStyles();

    return (
        <FixedFooter style={style}>
            {isLoading ? (
                <View style={[styles.w100, styles.justifyContentCenter, {height: variables.componentSizeLarge}]}>
                    <LoadingIndicator iconSize={28} />
                </View>
            ) : (
                children
            )}
        </FixedFooter>
    );
}

function AuthorizeButton({text, onPress, sentryLabel, style}: ActionButtonProps) {
    return (
        <Button
            sentryLabel={sentryLabel}
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.LARGE}
            style={style}
            onPress={onPress}
        >
            <Button.Text>{text}</Button.Text>
        </Button>
    );
}

function DenyButton({text, onPress, sentryLabel, style}: ActionButtonProps) {
    return (
        <Button
            sentryLabel={sentryLabel}
            variant={CONST.BUTTON_VARIANT.DANGER}
            size={CONST.BUTTON_SIZE.LARGE}
            style={style}
            onPress={onPress}
        >
            <Button.Text>{text}</Button.Text>
        </Button>
    );
}

MultifactorAuthenticationAuthorizeTransactionActions.displayName = 'MultifactorAuthenticationAuthorizeTransactionActions';
MultifactorAuthenticationAuthorizeTransactionActions.AuthorizeButton = AuthorizeButton;
MultifactorAuthenticationAuthorizeTransactionActions.DenyButton = DenyButton;

export default MultifactorAuthenticationAuthorizeTransactionActions;
