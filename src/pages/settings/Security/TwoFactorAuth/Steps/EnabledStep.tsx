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
import {hasPolicyWithXeroConnection} from '@libs/PolicyUtils';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function EnabledStep() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isVisible, setIsVisible] = useState(false);
    const {setStep} = useTwoFactorAuthContext();
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});

    const {translate} = useLocalize();

    const closeModal = useCallback(() => {
        setIsVisible(false);
    }, []);

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
                                if (hasPolicyWithXeroConnection(currentUserLogin)) {
                                    setIsVisible(true);
                                    return;
                                }
                                setStep(CONST.TWO_FACTOR_AUTH_STEPS.GETCODE);
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
        </StepWrapper>
    );
}

EnabledStep.displayName = 'EnabledStep';

export default EnabledStep;
