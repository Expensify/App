import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import TwoFactorAuthForm from './TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from './TwoFactorAuthForm/types';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

function ReplaceDeviceVerifyOldPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

    const formRef = useRef<BaseTwoFactorAuthFormRef>(null);

    // Navigate to verify new page when we receive the new secret key from the backend
    useEffect(() => {
        if (!account?.twoFactorAuthSecretKey) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_2FA_REPLACE_VERIFY_NEW);
    }, [account?.twoFactorAuthSecretKey]);

    return (
        <TwoFactorAuthWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.REPLACE_VERIFY_OLD}
            title={translate('twoFactorAuth.replaceDeviceTitle')}
            shouldEnableViewportOffsetTop
        >
            <ScrollView
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.ph5, styles.mb4, styles.mt3]}>
                    <Text style={[styles.textLabel, styles.mb4]}>{translate('twoFactorAuth.verifyOldDeviceDescription')}</Text>
                    <TwoFactorAuthForm
                        innerRef={formRef}
                        validateInsteadOfDisable
                        step={CONST.TWO_FACTOR_AUTH_STEPS.REPLACE_VERIFY_OLD}
                    />
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mt2, styles.pt2]}>
                <Button
                    success
                    large
                    text={translate('common.continue')}
                    isLoading={account?.isLoading}
                    onPress={() => {
                        if (!formRef.current) {
                            return;
                        }
                        formRef.current.validateAndSubmitForm();
                    }}
                />
            </FixedFooter>
        </TwoFactorAuthWrapper>
    );
}

export default ReplaceDeviceVerifyOldPage;
