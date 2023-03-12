import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import colors from '../styles/colors';
import styles from '../styles/styles';
import Icon from './Icon';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import * as Illustrations from './Icon/Illustrations';
import variables from '../styles/variables';
import TextLink from './TextLink';

const propTypes = {
    /** Whether the user has been signed in with the link. */
    isSuccessfullySignedIn: PropTypes.bool.isRequired,

    /** Whether two-factor authentication is required. */
    isTwoFactorAuthRequired: PropTypes.bool.isRequired,

    /** Code to display. */
    code: PropTypes.string.isRequired,

    /** Whether the user can get signed straight in the App from the current page */
    shouldShowSignInHere: PropTypes.bool,

    /** Callback to be called when user clicks the Sign in here link */
    onSignInHereClick: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldShowSignInHere: false,
    onSignInHereClick: () => {},
};

class ValidateCodeModal extends PureComponent {
    render() {
        let title;
        let description;
        let icon;
        let iconHeight;

        if (this.props.isSuccessfullySignedIn) {
            title = this.props.translate('validateCodeModal.success.title');
            description = this.props.translate('validateCodeModal.success.description');
            icon = Illustrations.Abracadabra;
            iconHeight = variables.modalTopBigIconHeight;
        } else if (this.props.isTwoFactorAuthRequired) {
            title = this.props.translate('validateCodeModal.twoFactorAuthRequired.title');
            description = this.props.translate('validateCodeModal.twoFactorAuthRequired.description');
            // TODO: make this the government spy pigeon
            icon = Illustrations.Abracadabra;
            iconHeight = variables.modalTopBigIconHeight;
        } else {
            title = this.props.translate('validateCodeModal.initial.title');
            description = this.props.translate('validateCodeModal.initial.description');
            icon = Illustrations.MagicCode;
            iconHeight = variables.modalTopIconHeight;
        }

        return (
            <View style={styles.deeplinkWrapperContainer}>
                <View style={styles.deeplinkWrapperMessage}>
                    <View style={styles.mb2}>
                        <Icon
                            width={variables.modalTopIconWidth}
                            height={iconHeight}
                            src={icon}
                        />
                    </View>
                    <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>
                        {title}
                    </Text>
                    <View style={[styles.mt2, styles.mb2]}>
                        <Text style={[styles.fontSizeNormal, styles.textAlignCenter]}>
                            {description}
                            {this.props.shouldShowSignInHere
                                && (
                                    <>
                                        {this.props.translate('validateCodeModal.or')}
                                        {' '}
                                        <TextLink onPress={this.props.onSignInHereClick}>
                                            {this.props.translate('validateCodeModal.signInHere')}
                                        </TextLink>
                                    </>
                                )}
                            {this.props.shouldShowSignInHere ? '!' : '.'}
                        </Text>
                    </View>
                    {!this.props.isSuccessfullySignedIn && !this.props.isTwoFactorAuthRequired && (
                        <View style={styles.mt6}>
                            <Text style={styles.magicCodeDigits}>
                                {this.props.code}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.deeplinkWrapperFooter}>
                    <Icon
                        width={variables.modalWordmarkWidth}
                        height={variables.modalWordmarkHeight}
                        fill={colors.green}
                        src={Expensicons.ExpensifyWordmark}
                    />
                </View>
            </View>
        );
    }
}

ValidateCodeModal.propTypes = propTypes;
ValidateCodeModal.defaultProps = defaultProps;
export default withLocalize(ValidateCodeModal);
