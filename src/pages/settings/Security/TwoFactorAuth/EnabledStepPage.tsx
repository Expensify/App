import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmModal from '@components/ConfirmModal';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {hasPolicyWithXeroConnection} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function EnabledStepPage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isVisible, setIsVisible] = useState(false);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const {translate} = useLocalize();

    const closeModal = useCallback(() => {
        setIsVisible(false);
    }, []);

    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={EnabledStepPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMaxHeight
            testID={EnabledStepPage.displayName}
        >
            <HeaderWithBackButton title={translate('twoFactorAuth.headerTitle')} />
            <FullPageOfflineBlockingView>
                <ScrollView>
                    <Section
                        title={translate('twoFactorAuth.twoFactorAuthEnabled')}
                        icon={Illustrations.ShieldYellow}
                        menuItems={[
                            {
                                title: translate('twoFactorAuth.disableTwoFactorAuth'),
                                onPress: () => {
                                    if (hasPolicyWithXeroConnection(currentUserLogin)) {
                                        setIsVisible(true);
                                        return;
                                    }
                                    Navigation.navigate(ROUTES.SETTINGS_2FA_GET_CODE);
                                },
                                icon: Expensicons.Close,
                                iconFill: theme.danger,
                                wrapperStyle: [styles.cardMenuItem],
                            },
                        ]}
                        containerStyles={[styles.twoFactorAuthSection]}
                    >
                        <View style={styles.mv3}>
                            <Text style={styles.textLabel}>{translate('twoFactorAuth.whatIsTwoFactorAuth')}</Text>
                        </View>
                    </Section>
                    <ConfirmModal
                        title={translate('twoFactorAuth.twoFactorAuthCannotDisable')}
                        prompt={translate('twoFactorAuth.twoFactorAuthRequired')}
                        confirmText={translate('common.buttonConfirm')}
                        onConfirm={closeModal}
                        shouldShowCancelButton={false}
                        onBackdropPress={closeModal}
                        onCancel={closeModal}
                        isVisible={isVisible}
                    />
                </ScrollView>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

EnabledStepPage.displayName = 'EnabledStepPage';

export default EnabledStepPage;
