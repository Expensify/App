import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, Image} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import {Paycheck, Bank, Lock} from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import Navigation from '../../libs/Navigation/Navigation';
import Permissions from '../../libs/Permissions';
import CONST from '../../CONST';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import ONYXKEYS from '../../ONYXKEYS';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import exampleCheckImage from '../../../assets/images/example-check-image.png';

const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    ...withLocalizePropTypes,
};

class BusinessBankAccountNewPage extends React.Component {
    constructor(props) {
        super(props);

        this.toggleTerms = this.toggleTerms.bind(this);
        this.addManualAccount = this.addManualAccount.bind(this);

        this.state = {
            // One of CONST.BANK_ACCOUNT.ADD_METHOD
            bankAccountAddMethod: undefined,
            hasAcceptedTerms: false,
            routingNumber: '',
            accountNumber: '',
        };
    }

    toggleTerms() {
        this.setState(prevState => ({
            hasAcceptedTerms: !prevState.hasAcceptedTerms,
        }));
    }

    /**
     * @returns {Boolean}
     */
    canSubmitManually() {
        return this.state.hasAcceptedTerms

            // These are taken from BankCountry.js in Web-Secure
            && CONST.BANK_ACCOUNT.REGEX.IBAN.test(this.state.accountNumber.trim())
            && CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(this.state.routingNumber.trim());
    }

    addManualAccount() {
        // @TODO call API to add account manually
    }

    render() {
        if (!Permissions.canUseFreePlan(this.props.betas)) {
            Navigation.dismissModal();
            return null;
        }

        return (
            <ScreenWrapper>
                <View style={[styles.flex1, styles.justifyContentBetween]}>
                    <HeaderWithCloseButton
                        title={this.props.translate('bankAccount.addBankAccount')}
                        onCloseButtonPress={Navigation.dismissModal}
                        onBackButtonPress={() => this.setState({bankAccountAddMethod: undefined})}
                        shouldShowBackButton={!_.isUndefined(this.state.bankAccountAddMethod)}
                    />
                    {!this.state.bankAccountAddMethod && (
                        <>
                            <View style={[styles.flex1]}>
                                <Text style={[styles.mh5, styles.mb5]}>
                                    {this.props.translate('bankAccount.toGetStarted')}
                                </Text>
                                <MenuItem
                                    icon={Bank}
                                    title={this.props.translate('bankAccount.logIntoYourBank')}
                                    onPress={() => {
                                        this.setState({bankAccountAddMethod: CONST.BANK_ACCOUNT.ADD_METHOD.PLAID});
                                    }}
                                    shouldShowRightIcon
                                />
                                <MenuItem
                                    icon={Paycheck}
                                    title={this.props.translate('bankAccount.connectManually')}
                                    onPress={() => {
                                        this.setState({bankAccountAddMethod: CONST.BANK_ACCOUNT.ADD_METHOD.MANUAL});
                                    }}
                                    shouldShowRightIcon
                                />
                                <View style={[styles.m5, styles.flexRow, styles.justifyContentBetween]}>
                                    <TextLink href="https://use.expensify.com/privacy">
                                        {this.props.translate('common.privacy')}
                                    </TextLink>
                                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        <TextLink
                                            // eslint-disable-next-line max-len
                                            href="https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/"
                                        >
                                            {this.props.translate('bankAccount.yourDataIsSecure')}
                                        </TextLink>
                                        <View style={[styles.ml1]}>
                                            <Icon src={Lock} fill={colors.blue} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                    {this.state.bankAccountAddMethod === CONST.BANK_ACCOUNT.ADD_METHOD.PLAID && (
                        <AddPlaidBankAccount
                            text={this.props.translate('bankAccount.plaidBodyCopy')}
                            onSubmit={(args) => {
                                console.debug(args);
                            }}
                            onExitPlaid={() => {
                                this.setState({bankAccountAddMethod: undefined});
                            }}
                        />
                    )}
                    {this.state.bankAccountAddMethod === CONST.BANK_ACCOUNT.ADD_METHOD.MANUAL && (
                        <>
                            <View style={[styles.m5, styles.flex1]}>
                                <Text style={[styles.mb5]}>
                                    {this.props.translate('bankAccount.checkHelpLine')}
                                </Text>
                                <Image
                                    resizeMode="contain"
                                    style={[styles.exampleCheckImage, styles.mb5]}
                                    source={exampleCheckImage}
                                />
                                <TextInputWithLabel
                                    placeholder={this.props.translate('bankAccount.routingNumber')}
                                    keyboardType="number-pad"
                                    value={this.state.routingNumber}
                                    onChangeText={routingNumber => this.setState({routingNumber})}
                                />
                                <TextInputWithLabel
                                    placeholder={this.props.translate('bankAccount.accountNumber')}
                                    keyboardType="number-pad"
                                    value={this.state.accountNumber}
                                    onChangeText={accountNumber => this.setState({accountNumber})}
                                />
                                <CheckboxWithLabel
                                    style={[styles.mb4, styles.mt5]}
                                    isChecked={this.state.hasAcceptedTerms}
                                    onPress={this.toggleTerms}
                                    LabelComponent={() => (
                                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                            <Text>
                                                {'I accept the '}
                                            </Text>
                                            <TextLink href="https://use.expensify.com/terms">
                                                {`Expensify ${this.props.translate('common.termsOfService')}`}
                                            </TextLink>
                                        </View>
                                    )}
                                />
                            </View>
                            <Button
                                success
                                text={this.props.translate('common.saveAndContinue')}
                                style={[styles.m5]}
                                isDisabled={!this.canSubmitManually()}
                                onPress={this.addManualAccount}
                            />
                        </>
                    )}
                </View>
            </ScreenWrapper>
        );
    }
}

BusinessBankAccountNewPage.propTypes = propTypes;

export default compose(
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
    withLocalize,
)(BusinessBankAccountNewPage);
