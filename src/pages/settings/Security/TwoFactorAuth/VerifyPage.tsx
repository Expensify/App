import React, {useCallback, useEffect, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';
import {getContactMethod} from '@libs/UserUtils';
import {clearAccountMessages} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import TwoFactorAuthForm from './TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from './TwoFactorAuthForm/types';
import TwoFactorAuthSecretDisplay from './TwoFactorAuthSecretDisplay';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

const TROUBLESHOOTING_LINK = 'https://help.expensify.com/articles/new-expensify/settings/Enable-Two-Factor-Authentication';

type VerifyPageProps = PlatformStackScreenProps<TwoFactorAuthNavigatorParamList, typeof SCREENS.TWO_FACTOR_AUTH.VERIFY>;

function VerifyPage({route}: VerifyPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const contactMethod = getContactMethod(account?.primaryLogin, session?.email);
    const formRef = useRef<BaseTwoFactorAuthFormRef>(null);

    useEffect(() => {
        clearAccountMessages();
        return () => {
            clearAccountMessages();
        };
    }, []);

    useEffect(() => {
        if (!account?.requiresTwoFactorAuth || !account.codesAreCopied) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_2FA_SUCCESS.getRoute(route.params?.backTo, route.params?.forwardTo), {forceReplace: true});
    }, [account?.codesAreCopied, account?.requiresTwoFactorAuth, route.params?.backTo, route.params?.forwardTo]);

    const scrollViewRef = useRef<RNScrollView>(null);
    const handleInputFocus = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                scrollViewRef.current?.scrollToEnd({animated: true});
            });
        });
    }, []);

    return (
        <TwoFactorAuthWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.VERIFY}
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 2,
                text: translate('twoFactorAuth.stepVerify'),
                total: 3,
            }}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_2FA_ROOT.getRoute(route.params?.backTo, route.params?.forwardTo))}
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
                        description={
                            <Text>
                                {translate('twoFactorAuth.scanCode')}
                                <TextLink href={TROUBLESHOOTING_LINK}> {translate('twoFactorAuth.authenticatorApp')}</TextLink>.
                            </Text>
                        }
                    />
                    <Text style={styles.mt11}>{translate('twoFactorAuth.enterCode')}</Text>
                </View>
                <View style={[styles.mh5, styles.mb4, styles.mt3]}>
                    <TwoFactorAuthForm
                        innerRef={formRef}
                        shouldAutoFocusOnMobile={false}
                        onFocus={handleInputFocus}
                    />
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mt2, styles.pt2]}>
                <Button
                    success
                    large
                    text={translate('common.next')}
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

export default VerifyPage;
