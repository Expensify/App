import React, {useState} from 'react';
import {Text, View} from 'react-native';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import Section from '../../../../components/Section';
import * as Illustrations from '../../../../components/Icon/Illustrations';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import themeColors from '../../../../styles/themes/default';
import styles from '../../../../styles/styles';
import ConfirmModal from '../../../../components/ConfirmModal';

const defaultProps = {};

function IsEnabledPage(props) {
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('twoFactorAuth.headerTitle')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Section
                title={props.translate('twoFactorAuth.twoFactorAuthEnabled')}
                icon={Illustrations.ShieldYellow}
                menuItems={[
                    {
                        title: props.translate('twoFactorAuth.disableTwoFactorAuth'),
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
                    <Text style={styles.textLabel}>{props.translate('twoFactorAuth.whatIsTwoFactorAuth')}</Text>
                </View>
            </Section>
            <ConfirmModal
                title={props.translate('twoFactorAuth.disableTwoFactorAuth')}
                onConfirm={() => {
                    setIsConfirmModalVisible(false);
                    Navigation.navigate(ROUTES.SETTINGS_2FA_DISABLE);
                }}
                onCancel={() => setIsConfirmModalVisible(false)}
                onModalHide={() => setIsConfirmModalVisible(false)}
                isVisible={isConfirmModalVisible}
                prompt={props.translate('twoFactorAuth.disableTwoFactorAuthConfirmation')}
                confirmText={props.translate('twoFactorAuth.disable')}
                cancelText={props.translate('common.cancel')}
                shouldShowCancelButton
                danger
            />
        </ScreenWrapper>
    );
}

IsEnabledPage.propTypes = withLocalizePropTypes;
IsEnabledPage.defaultProps = defaultProps;

export default withLocalize(IsEnabledPage);
