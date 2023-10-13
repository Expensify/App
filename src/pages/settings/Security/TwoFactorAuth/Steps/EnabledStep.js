import React, {useEffect, useState} from 'react';
import {Text, View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Section from '../../../../../components/Section';
import * as Illustrations from '../../../../../components/Icon/Illustrations';
import * as Expensicons from '../../../../../components/Icon/Expensicons';
import themeColors from '../../../../../styles/themes/default';
import styles from '../../../../../styles/styles';
import ConfirmModal from '../../../../../components/ConfirmModal';
import * as Session from '../../../../../libs/actions/Session';
import StepWrapper from '../StepWrapper/StepWrapper';
import useLocalize from '../../../../../hooks/useLocalize';
import Navigation from '../../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../../ROUTES';
import CONST from '../../../../../CONST';
import {TwoFactorAuthPropTypes} from '../TwoFactorAuthPropTypes';
import ONYXKEYS from '../../../../../ONYXKEYS';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';

function EnabledStep({account}) {
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const {translate} = useLocalize();

    useEffect(() => {
        if (account.requiresTwoFactorAuth) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_2FA.CODES, CONST.NAVIGATION.TYPE.FORCED_UP);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        TwoFactorAuthActions.setTwoFactorAuthStep('DISABLED');
                        Navigation.navigate(ROUTES.SETTINGS_2FA.DISABLED, CONST.NAVIGATION.TYPE.FORCED_UP);
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

EnabledStep.propTypes = TwoFactorAuthPropTypes;

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(EnabledStep);
