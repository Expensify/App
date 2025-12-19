import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type MultifactorAuthenticationRevokeContentProps = {
    isAccessRevoked: boolean;
    onGoBackPress: () => void;
    onShowConfirmModal: () => void;
};

function MultifactorAuthenticationRevokeContent({isAccessRevoked, onGoBackPress, onShowConfirmModal}: MultifactorAuthenticationRevokeContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (isAccessRevoked) {
        return (
            <>
                <View style={styles.flex1}>
                    <Text style={[styles.mt3, styles.ph5]}>{translate('multifactorAuthentication.revokeAccess.youHaveNotRegisteredAnyDevices')}</Text>
                </View>
                <View style={[styles.flexRow, styles.m5, styles.mt0]}>
                    <Button
                        success
                        style={[styles.flex1]}
                        onPress={onGoBackPress}
                        text={translate('common.buttonConfirm')}
                    />
                </View>
            </>
        );
    }

    return (
        <>
            <View style={styles.flex1}>
                <Text style={[styles.mt3, styles.ph5]}>{translate('multifactorAuthentication.revokeAccess.verificationIsEnabledAndYouCanRevoke')}</Text>
            </View>
            <View style={[styles.flexRow, styles.m5, styles.mt0]}>
                <Button
                    danger
                    style={[styles.flex1]}
                    onPress={onShowConfirmModal}
                    text={translate('multifactorAuthentication.revokeAccess.revokeAccess')}
                />
            </View>
        </>
    );
}

MultifactorAuthenticationRevokeContent.displayName = 'MultifactorAuthenticationRevokeContent';

export default MultifactorAuthenticationRevokeContent;
