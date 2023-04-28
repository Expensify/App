import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import ROUTES from '../../../../ROUTES';
import Section from '../../../../components/Section';
import * as Illustrations from '../../../../components/Icon/Illustrations';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import themeColors from '../../../../styles/themes/default';
import styles from '../../../../styles/styles';
import ConfirmModal from '../../../../components/ConfirmModal';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {
};

class PasswordPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isConfirmModalVisible: false,
        };

        this.showConfirmModal = this.showConfirmModal.bind(this);
        this.hideConfirmModal = this.hideConfirmModal.bind(this);
        this.hideAndNavigate = this.hideAndNavigate.bind(this);
    }

    showConfirmModal() {
        this.setState({isConfirmModalVisible: true});
    }

    hideConfirmModal() {
        this.setState({isConfirmModalVisible: false});
    }

    hideAndNavigate() {
        this.hideConfirmModal();
        Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_DISABLE);
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('twoFactorAuth.headerTitle')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />

                <Section
                    title={this.props.translate('twoFactorAuth.twoFactorAuthEnabled')}
                    icon={Illustrations.ShieldYellow}
                    menuItems={[{
                        title: this.props.translate('twoFactorAuth.disableTwoFactorAuth'),
                        onPress: () => { this.showConfirmModal(); },
                        icon: Expensicons.Close,
                        iconFill: themeColors.danger,
                        wrapperStyle: [styles.cardMenuItem],
                    }]}
                    containerStyles={[styles.cardSection]}
                >
                    <View style={[styles.mv3]}>
                        <Text style={[styles.textLabel]}>
                            {this.props.translate('twoFactorAuth.whatIsTwoFactorAuth')}
                        </Text>
                    </View>
                </Section>

                <ConfirmModal
                    title={this.props.translate('twoFactorAuth.disableTwoFactorAuth')}
                    onConfirm={this.hideAndNavigate}
                    onCancel={this.hideConfirmModal}
                    onModalHide={this.hideConfirmModal}
                    isVisible={this.state.isConfirmModalVisible}
                    prompt={this.props.translate('twoFactorAuth.disableTwoFactorAuthConfirmation')}
                    confirmText={this.props.translate('common.yes')}
                    cancelText={this.props.translate('common.cancel')}
                    shouldShowCancelButton
                />

            </ScreenWrapper>
        );
    }
}

PasswordPage.propTypes = propTypes;
PasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
    }),
)(PasswordPage);
