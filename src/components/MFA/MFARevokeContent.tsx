import React, {memo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type MFARevokeContentProps = {
    isAccessRevoked: boolean;
    onGoBackPress: () => void;
    onShowConfirmModal: () => void;
};

function MFARevokeContent({isAccessRevoked, onGoBackPress, onShowConfirmModal}: MFARevokeContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (isAccessRevoked) {
        return (
            <>
                <View style={[styles.flex1]}>
                    <Text style={[styles.mt3, styles.ph5]}>{translate('multiFactorAuthentication.revokePage.renableContent')}</Text>
                </View>
                <View style={[styles.flexRow, styles.m5]}>
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
            <View style={[styles.flex1]}>
                <Text style={[styles.mt3, styles.ph5]}>{translate('multiFactorAuthentication.revokePage.revokeContent')}</Text>
            </View>
            <View style={[styles.flexRow, styles.m5]}>
                <Button
                    danger
                    style={[styles.flex1]}
                    onPress={onShowConfirmModal}
                    text={translate('multiFactorAuthentication.revokePage.bottomButtonContent')}
                />
            </View>
        </>
    );
}

MFARevokeContent.displayName = 'MFARevokeContent';

export default memo(MFARevokeContent);

