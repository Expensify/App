import React, {useEffect, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getContactMethod} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import TwoFactorAuthForm from './TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from './TwoFactorAuthForm/types';
import TwoFactorAuthSecretDisplay from './TwoFactorAuthSecretDisplay';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

function ReplaceDeviceVerifyNewPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const contactMethod = getContactMethod(account?.primaryLogin, session?.email);
    const formRef = useRef<BaseTwoFactorAuthFormRef>(null);

    const scrollViewRef = useRef<RNScrollView>(null);

    // Navigate back to 2FA settings after successful device replacement
    useEffect(() => {
        if (!account || account.twoFactorAuthSecretKey) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_2FA_SUCCESS.route, { forceReplace: true });
    }, [account, account?.twoFactorAuthSecretKey]);

    const handleInputFocus = () => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                scrollViewRef.current?.scrollToEnd({animated: true});
            });
        });
    };

    return (
        <TwoFactorAuthWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.REPLACE_VERIFY_NEW}
            title={translate('twoFactorAuth.replaceDeviceTitle')}
            shouldEnableViewportOffsetTop
        >
            <ScrollView
                ref={scrollViewRef}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.flexGrow1}
            >
                <View style={[styles.ph5, styles.mt3]}>
                    <TwoFactorAuthSecretDisplay
                        contactMethod={contactMethod}
                        secretKey={account?.twoFactorAuthSecretKey ?? ''}
                        description={<Text style={[styles.textLabel, styles.mb4]}>{translate('twoFactorAuth.verifyNewDeviceDescription')}</Text>}
                    />
                    <Text style={[styles.mt5, styles.mb3, styles.textLabel]}>{translate('twoFactorAuth.enterCode')}</Text>
                    <TwoFactorAuthForm
                        innerRef={formRef}
                        onFocus={handleInputFocus}
                        validateInsteadOfDisable
                        step={CONST.TWO_FACTOR_AUTH_STEPS.REPLACE_VERIFY_NEW}
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

export default ReplaceDeviceVerifyNewPage;
