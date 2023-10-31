import React, {useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';

function EnabledStep() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const {setStep} = useTwoFactorAuthContext();

    const {translate} = useLocalize();

    return (
        <StepWrapper title={translate('twoFactorAuth.headerTitle')}>
            <ScrollView>
                <Section
                    title={translate('twoFactorAuth.twoFactorAuthEnabled')}
                    icon={Illustrations.ShieldYellow}
                    menuItems={[
                        {
                            title: translate('twoFactorAuth.disableTwoFactorAuth'),
                            onPress: () => {
                                setIsConfirmModalVisible(true);
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
                    title={translate('twoFactorAuth.disableTwoFactorAuth')}
                    onConfirm={() => {
                        setIsConfirmModalVisible(false);
                        setStep(CONST.TWO_FACTOR_AUTH_STEPS.DISABLED);
                        Session.toggleTwoFactorAuth(false);
                    }}
                    onCancel={() => setIsConfirmModalVisible(false)}
                    onModalHide={() => setIsConfirmModalVisible(false)}
                    isVisible={isConfirmModalVisible}
                    prompt={translate('twoFactorAuth.disableTwoFactorAuthConfirmation')}
                    confirmText={translate('twoFactorAuth.disable')}
                    cancelText={translate('common.cancel')}
                    shouldShowCancelButton
                    danger
                />
            </ScrollView>
        </StepWrapper>
    );
}

EnabledStep.displayName = 'EnabledStep';

export default EnabledStep;
