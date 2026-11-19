import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import LoadingIndicator from '@components/LoadingIndicator';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';
import {View} from 'react-native';

type MultifactorAuthenticationAuthorizeTransactionActionsProps = {
    onAuthorize: () => void;
    onDeny: () => void;
    isLoading: boolean | undefined;

    /** Label of the deny button */
    denyText: string;

    /** Label of the authorize button */
    authorizeText: string;

    /** Sentry label of the deny button, so each review screen is tracked on its own */
    denySentryLabel?: SentryLabel;

    /** Sentry label of the authorize button, so each review screen is tracked on its own */
    authorizeSentryLabel?: SentryLabel;

    /** Stacks the buttons full width with authorize on top, for labels too long to sit side by side */
    shouldStackButtons?: boolean;
};

function MultifactorAuthenticationAuthorizeTransactionActions({
    onAuthorize,
    onDeny,
    isLoading,
    denyText,
    authorizeText,
    denySentryLabel = CONST.SENTRY_LABEL.MULTIFACTOR_AUTHENTICATION.AUTHORIZE_TRANSACTION_DENY,
    authorizeSentryLabel = CONST.SENTRY_LABEL.MULTIFACTOR_AUTHENTICATION.AUTHORIZE_TRANSACTION_APPROVE,
    shouldStackButtons = false,
}: MultifactorAuthenticationAuthorizeTransactionActionsProps) {
    const styles = useThemeStyles();

    const buttonStyle = shouldStackButtons ? undefined : styles.flex1;

    const denyButton = (
        <Button
            sentryLabel={denySentryLabel}
            variant={CONST.BUTTON_VARIANT.DANGER}
            size={CONST.BUTTON_SIZE.LARGE}
            style={buttonStyle}
            onPress={onDeny}
        >
            <Button.Text>{denyText}</Button.Text>
        </Button>
    );

    const authorizeButton = (
        <Button
            sentryLabel={authorizeSentryLabel}
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.LARGE}
            style={buttonStyle}
            onPress={onAuthorize}
        >
            <Button.Text>{authorizeText}</Button.Text>
        </Button>
    );

    return (
        <FixedFooter style={[shouldStackButtons ? styles.flexColumn : styles.flexRow, styles.gap2]}>
            {isLoading ? (
                <View style={[styles.w100, styles.justifyContentCenter, {height: variables.componentSizeLarge}]}>
                    <LoadingIndicator iconSize={28} />
                </View>
            ) : (
                <>
                    {shouldStackButtons ? authorizeButton : denyButton}
                    {shouldStackButtons ? denyButton : authorizeButton}
                </>
            )}
        </FixedFooter>
    );
}

MultifactorAuthenticationAuthorizeTransactionActions.displayName = 'MultifactorAuthenticationAuthorizeTransactionActions';

export default MultifactorAuthenticationAuthorizeTransactionActions;
