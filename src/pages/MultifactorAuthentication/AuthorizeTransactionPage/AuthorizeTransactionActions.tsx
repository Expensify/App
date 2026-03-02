import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import LoadingIndicator from '@components/LoadingIndicator';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type MultifactorAuthenticationAuthorizeTransactionActionsProps = {
    onAuthorize: () => void;
    onDeny: () => void;
    isLoading: boolean | undefined;
};

function MultifactorAuthenticationAuthorizeTransactionActions({onAuthorize, onDeny, isLoading}: MultifactorAuthenticationAuthorizeTransactionActionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FixedFooter style={[styles.flexRow, styles.gap2]}>
            {isLoading ? (
                <View style={[styles.w100, styles.h10]}>
                    <LoadingIndicator />
                </View>
            ) : (
                <>
                    <Button
                        danger
                        large
                        style={styles.flex1}
                        onPress={onDeny}
                        text={translate('multifactorAuthentication.reviewTransaction.deny')}
                    />
                    <Button
                        success
                        large
                        style={styles.flex1}
                        onPress={onAuthorize}
                        text={translate('multifactorAuthentication.reviewTransaction.approve')}
                    />
                </>
            )}
        </FixedFooter>
    );
}

MultifactorAuthenticationAuthorizeTransactionActions.displayName = 'MultifactorAuthenticationAuthorizeTransactionActions';

export default MultifactorAuthenticationAuthorizeTransactionActions;
