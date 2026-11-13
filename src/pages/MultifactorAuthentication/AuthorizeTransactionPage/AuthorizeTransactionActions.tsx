import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import LoadingIndicator from '@components/LoadingIndicator';

import useLocalize from '@hooks/useLocalize';
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

    /** Defaults to "Deny" */
    denyText?: string;

    /** Defaults to "Approve" */
    authorizeText?: string;

    /** Sentry label of the deny button, so each review screen is tracked on its own */
    denySentryLabel?: SentryLabel;

    /** Sentry label of the authorize button, so each review screen is tracked on its own */
    authorizeSentryLabel?: SentryLabel;
};

function MultifactorAuthenticationAuthorizeTransactionActions({
    onAuthorize,
    onDeny,
    isLoading,
    denyText,
    authorizeText,
    denySentryLabel = CONST.SENTRY_LABEL.MULTIFACTOR_AUTHENTICATION.AUTHORIZE_TRANSACTION_DENY,
    authorizeSentryLabel = CONST.SENTRY_LABEL.MULTIFACTOR_AUTHENTICATION.AUTHORIZE_TRANSACTION_APPROVE,
}: MultifactorAuthenticationAuthorizeTransactionActionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FixedFooter style={[styles.flexRow, styles.gap2]}>
            {isLoading ? (
                <View style={[styles.w100, styles.justifyContentCenter, {height: variables.componentSizeLarge}]}>
                    <LoadingIndicator iconSize={28} />
                </View>
            ) : (
                <>
                    <Button
                        variant={CONST.BUTTON_VARIANT.DANGER}
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={styles.flex1}
                        onPress={onDeny}
                        sentryLabel={denySentryLabel}
                    >
                        <Button.Text>{denyText ?? translate('multifactorAuthentication.reviewTransaction.deny')}</Button.Text>
                    </Button>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={styles.flex1}
                        onPress={onAuthorize}
                        sentryLabel={authorizeSentryLabel}
                    >
                        <Button.Text>{authorizeText ?? translate('multifactorAuthentication.reviewTransaction.approve')}</Button.Text>
                    </Button>
                </>
            )}
        </FixedFooter>
    );
}

MultifactorAuthenticationAuthorizeTransactionActions.displayName = 'MultifactorAuthenticationAuthorizeTransactionActions';

export default MultifactorAuthenticationAuthorizeTransactionActions;
