import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import QRCode from 'react-qr-code';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import styles from '../../../../styles/styles';
import FixedFooter from '../../../../components/FixedFooter';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import ONYXKEYS from '../../../../ONYXKEYS';
import TextLink from '../../../../components/TextLink';
import Clipboard from '../../../../libs/Clipboard';
import Form from '../../../../components/Form';
import * as Session from '../../../../libs/actions/Session';
import TextInput from '../../../../components/TextInput';
import CONST from '../../../../CONST';
import Log from '../../../../libs/Log';

const propTypes = {
    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** Whether this account has 2-FA enabled or not */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Secret key to enable 2-FA within the authenticator app */
        twoFactorAuthSecretKey: PropTypes.string,
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {
        requiresTwoFactorAuth: false,
        twoFactorAuthSecretKey: '',
    },
};

class VerifyPage extends Component {
    constructor(props) {
        super(props);

        this.copySecret = this.copySecret.bind(this);
        this.validateCode = this.validateCode.bind(this);

        // TODO: REMOVE!
        this.fakeSecretKey = 'ABCD EFHH KJSD IWIQ';
    }

    componentDidMount() {
        Log.info('account =====', false, this.props.account);
    }

    componentDidUpdate(prevProps) {
        Log.info('account =====', false, this.props.account);

        if (!this.props.account.requiresTwoFactorAuth) {
            return;
        }

        if (!prevProps.account.requiresTwoFactorAuth && this.props.account.requiresTwoFactorAuth) {
            Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_SUCCESS);
        }
    }

    copySecret() {
        Clipboard.setString(this.props.account.twoFactorAuthSecretKey);
    }

    validateCode(code) {
        // TODO: Should be 6 digits and all numbers
        console.log({code});
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('twoFactorAuth.headerTitle')}
                    subtitle={this.props.translate('twoFactorAuth.stepVerify')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_CODES)}
                />

                <FullPageOfflineBlockingView>
                    <View style={[styles.ph5]}>
                        <Text>
                            {this.props.translate('twoFactorAuth.scanCode')}
                            <TextLink href="https://community.expensify.com/discussion/7736/faq-troubleshooting-two-factor-authentication-issues/p1?new=1">
                                {' '}
                                {this.props.translate('twoFactorAuth.authenticatorApp')}
                            </TextLink>
                            .
                        </Text>

                        <View style={[styles.alignItemsCenter, styles.mt5]}>
                            <QRCode
                                size={128}
                                level="Q"
                                style={{borderRadius: 5}}
                                value={this.props.account.twoFactorAuthSecretKey || this.fakeSecretKey}
                                bgColor="#061B09"
                                fgColor="#AFBBB0"
                            />
                        </View>

                        <Text style={[styles.mt5]}>
                            {this.props.translate('twoFactorAuth.addKey')}
                        </Text>

                        <View style={[styles.mt5, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <Text>
                                {this.props.account.twoFactorAuthSecretKey || this.fakeSecretKey}
                            </Text>
                            <Button medium onPress={this.copySecret}>
                                <Text>
                                    Copy
                                </Text>
                            </Button>
                        </View>

                        <Text style={[styles.mt5]}>
                            {this.props.translate('twoFactorAuth.enterCode')}
                        </Text>

                        <Text style={[styles.mt5]}>
                            {/* TODO: NUMBER KEYBOARD */}
                            <Form
                                formID={ONYXKEYS.FORMS.VERIFY_TWO_FACTOR_AUTH_FORM}
                                submitButtonText={this.props.translate('common.verify')}
                                validate={this.validateCode}
                                onSubmit={() => Session.validateTwoFactorAuth()}
                            >
                                <TextInput
                                    inputID="verifyTwoFactorAuth"
                                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                    label={this.props.translate('newTaskPage.title')}
                                />
                            </Form>
                        </Text>

                    </View>

                    <FixedFooter style={[styles.twoFactorAuthFooter]}>
                        <Button
                            success
                            text={this.props.translate('common.next')}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_VERIFY)}
                        />
                    </FixedFooter>
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        );
    }
}

VerifyPage.propTypes = propTypes;
VerifyPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(VerifyPage);
