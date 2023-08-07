import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import Text from '../../../../components/Text';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
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
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';

const defaultProps = {};

function IsEnabledPage(props) {
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={props.translate('twoFactorAuth.headerTitle')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_SECURITY)}
            />
            <FullPageOfflineBlockingView>
                <ScrollView>
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
                            <Text>{props.translate('twoFactorAuth.whatIsTwoFactorAuth')}</Text>
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
                </ScrollView>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

IsEnabledPage.propTypes = withLocalizePropTypes;
IsEnabledPage.defaultProps = defaultProps;

export default withLocalize(IsEnabledPage);
