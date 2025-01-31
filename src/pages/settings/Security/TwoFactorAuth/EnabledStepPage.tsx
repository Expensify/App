import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {hasPolicyWithXeroConnection} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import PageWrapper from './PageWrapper';

function EnabledStepPage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isVisible, setIsVisible] = useState(false);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});

    const {translate} = useLocalize();

    const closeModal = useCallback(() => {
        setIsVisible(false);
    }, []);

    return (
        <PageWrapper
            stepName={EnabledStepPage.displayName}
            title={translate('twoFactorAuth.headerTitle')}
            shouldEnableKeyboardAvoidingView={false}
        >
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
        </PageWrapper>
    );
}

EnabledStepPage.displayName = 'EnabledStepPage';

export default EnabledStepPage;
