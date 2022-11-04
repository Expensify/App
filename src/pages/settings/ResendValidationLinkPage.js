import React, {Component} from 'react';
import {View} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import ResendValidationMessage from './ResendValidationMessage';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {
};

class ResendValidationLinkPage extends Component {
    render() {
        return (
            <ScreenWrapper onTransitionEnd={() => {
                if (!this.currentPasswordInputRef) {
                    return;
                }

                this.currentPasswordInputRef.focus();
            }}
            >
                <HeaderWithCloseButton
                    title={this.props.translate('resendValidationForm.resendLink')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.ph5, styles.pb5]}>
                    <ResendValidationMessage />
                </View>
            </ScreenWrapper>
        );
    }
}

ResendValidationLinkPage.propTypes = propTypes;
ResendValidationLinkPage.defaultProps = defaultProps;

export default withLocalize(ResendValidationLinkPage);
