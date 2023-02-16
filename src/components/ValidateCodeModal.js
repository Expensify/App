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
    isSuccessfullySignedIn: PropTypes.bool,

    /** Code to display. */
    code: PropTypes.string.isRequired,

    /** Whether the user can get signed straight in the App from the current page */
    shouldShowSignInHere: PropTypes.bool,

    /** Callback to be called when user clicks the Sign in here link */
    onSignInHereClick: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isSuccessfullySignedIn: false,
    shouldShowSignInHere: false,
    onSignInHereClick: () => {},
};

class ValidateCodeModal extends PureComponent {
    render() {
        return (
            <View style={styles.deeplinkWrapperContainer}>
                <View style={styles.deeplinkWrapperMessage}>
                    <View style={styles.mb2}>
                        <Icon
                            width={variables.modalTopIconWidth}
                            height={this.props.isSuccessfullySignedIn ? variables.modalTopBigIconHeight : variables.modalTopIconHeight}
                            src={this.props.isSuccessfullySignedIn ? Illustrations.Abracadabra : Illustrations.MagicCode}
                        />
                    </View>
                    <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>
                        {this.props.translate(this.props.isSuccessfullySignedIn ? 'validateCodeModal.successfulSignInTitle' : 'validateCodeModal.title')}
                    </Text>
                    <View style={[styles.mt2, styles.mb2]}>
                        <Text style={[styles.fontSizeNormal, styles.textAlignCenter]}>
                            {this.props.translate(this.props.isSuccessfullySignedIn ? 'validateCodeModal.successfulSignInDescription' : 'validateCodeModal.description')}
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
                    {!this.props.isSuccessfullySignedIn && (
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
