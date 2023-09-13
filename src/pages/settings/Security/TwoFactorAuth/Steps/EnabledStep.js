import React, {useState} from 'react';
import {Text, View, ScrollView} from 'react-native';
import Section from '../../../../../components/Section';
import * as Illustrations from '../../../../../components/Icon/Illustrations';
import * as Expensicons from '../../../../../components/Icon/Expensicons';
import themeColors from '../../../../../styles/themes/default';
import styles from '../../../../../styles/styles';
import ConfirmModal from '../../../../../components/ConfirmModal';
import * as Session from '../../../../../libs/actions/Session';
import StepWrapper from '../StepWrapper/StepWrapper';
import CONST from '../../../../../CONST';
import useLocalize from '../../../../../hooks/useLocalize';
import useTwoFactorAuthContext from '../TwoFactorAuthContext/useTwoFactorAuth';

function EnabledStep() {
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
                            iconFill: themeColors.danger,
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

export default EnabledStep;
