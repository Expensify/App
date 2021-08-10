import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import {
    View,
    ScrollView,
} from 'react-native';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../components/ScreenWrapper';
import TextInputWithLabel from '../../../components/TextInputWithLabel';
import styles from '../../../styles/styles';
import StatePicker from '../../../components/StatePicker';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import {addBillingCard} from '../../../libs/actions/PaymentMethods';
import Button from '../../../components/Button';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import FixedFooter from '../../../components/FixedFooter';
import Growl from '../../../libs/Growl';
import {
    isValidAddress, isValidExpirationDate, isValidZipCode, isValidDebitCard,
} from '../../../libs/ValidationUtils';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';

const propTypes = {
    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
};

class DebitCardPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nameOnCard: '',
            cardNumber: '',
            expirationDate: '',
            securityCode: '',
            billingAddress: '',
            city: '',
            selectedState: '',
            zipCode: '',
            acceptedTerms: false,
        };

        // These fields need to be filled out in order to submit the form
        this.requiredFields = [
            'nameOnCard',
            'cardNumber',
            'expirationDate',
            'securityCode',
            'billingAddress',
            'city',
            'selectedState',
            'zipCode',
        ];

        this.toggleTermsOfService = this.toggleTermsOfService.bind(this);
        this.submit = this.submit.bind(this);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        if (this.state.nameOnCard === '') {
            Growl.error(this.props.translate('addDebitCardPage.error.invalidName'));
            return false;
        }

        if (!isValidDebitCard(this.state.cardNumber.replace(/ /g, ''))) {
            Growl.error(this.props.translate('addDebitCardPage.error.debitCardNumber'));
            return false;
        }

        if (!isValidExpirationDate(this.state.expirationDate)) {
            Growl.error(this.props.translate('addDebitCardPage.error.expirationDate'));
            return false;
        }

        if (!/^[0-9]{3,4}$/.test(this.state.securityCode)) {
            Growl.error(this.props.translate('addDebitCardPage.error.securityCode'));
            return false;
        }

        if (!isValidAddress(this.state.billingAddress)) {
            Growl.error(this.props.translate('addDebitCardPage.error.address'));
            return false;
        }

        if (this.state.city === '') {
            Growl.error(this.props.translate('addDebitCardPage.error.addressCity'));
            return false;
        }

        if (this.state.selectedState === '') {
            Growl.error(this.props.translate('addDebitCardPage.error.addressState'));
            return false;
        }

        if (!isValidZipCode(this.state.zipCode)) {
            Growl.error(this.props.translate('addDebitCardPage.error.zipCode'));
            return false;
        }

        if (!this.state.acceptedTerms) {
            Growl.error(this.props.translate('addDebitCardPage.error.acceptedTerms'));
            return false;
        }

        return true;
    }

    submit() {
        if (!this.validate()) {
            return;
        }
        addBillingCard(this.state);
    }

    toggleTermsOfService() {
        this.setState(prevState => ({acceptedTerms: !prevState.acceptedTerms}));
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('addDebitCardPage.addADebitCard')}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <TextInputWithLabel
                            label={this.props.translate('addDebitCardPage.nameOnCard')}
                            placeholder={this.props.translate('addDebitCardPage.nameOnCard')}
                            containerStyles={[styles.flex1, styles.mb2]}
                            onChangeText={nameOnCard => this.setState({nameOnCard})}
                            value={this.state.nameOnCard}
                        />
                        <TextInputWithLabel
                            label={this.props.translate('addDebitCardPage.debitCardNumber')}
                            placeholder={this.props.translate('addDebitCardPage.debitCardNumber')}
                            keyboardType="number-pad"
                            containerStyles={[styles.flex1, styles.mb2]}
                            onChangeText={cardNumber => this.setState({cardNumber})}
                            value={this.state.cardNumber}
                        />
                        <View style={[styles.flexRow, styles.mb2]}>
                            <TextInputWithLabel
                                label={this.props.translate('addDebitCardPage.expiration')}
                                placeholder={this.props.translate('addDebitCardPage.expirationDate')}
                                keyboardType="number-pad"
                                containerStyles={[styles.flex2, styles.mr4]}
                                onChangeText={expirationDate => this.setState({expirationDate})}
                                value={this.state.expirationDate}
                            />
                            <TextInputWithLabel
                                label={this.props.translate('addDebitCardPage.cvv')}
                                placeholder="123"
                                keyboardType="number-pad"
                                containerStyles={[styles.flex2]}
                                onChangeText={securityCode => this.setState({securityCode})}
                                value={this.state.securityCode}
                            />
                        </View>
                        <TextInputWithLabel
                            label={this.props.translate('addDebitCardPage.billingAddress')}
                            placeholder={this.props.translate('addDebitCardPage.streetAddress')}
                            containerStyles={[styles.flex1, styles.mb2]}
                            onChangeText={billingAddress => this.setState({billingAddress})}
                            value={this.state.billingAddress}
                        />
                        <TextInputWithLabel
                            label={this.props.translate('common.city')}
                            placeholder={this.props.translate('addDebitCardPage.cityName')}
                            containerStyles={[styles.flex1, styles.mb2]}
                            onChangeText={city => this.setState({city})}
                            value={this.state.city}
                        />
                        <View style={[styles.flexRow, styles.mb6]}>
                            <View style={[styles.flex2, styles.mr4]}>
                                <Text style={[styles.mb1, styles.formLabel]}>
                                    {this.props.translate('common.state')}
                                </Text>
                                <StatePicker
                                    onChange={state => this.setState({selectedState: state})}
                                    value={this.state.selectedState}
                                />
                            </View>
                            <TextInputWithLabel
                                label={this.props.translate('common.zip')}
                                placeholder={this.props.translate('common.zip')}
                                containerStyles={[styles.flex2]}
                                onChangeText={zipCode => this.setState({zipCode})}
                                value={this.state.zipCode}
                            />
                        </View>
                        <CheckboxWithLabel
                            isChecked={this.state.acceptedTerms}
                            onPress={this.toggleTermsOfService}
                            LabelComponent={() => (
                                <Text>
                                    {`${this.props.translate('common.iAcceptThe')} `}
                                    <TextLink href="https://use.expensify.com/terms">
                                        {`${this.props.translate('addDebitCardPage.expensifyTermsOfService')}`}
                                    </TextLink>
                                </Text>
                            )}
                        />
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            success
                            onPress={this.submit}
                            style={[styles.w100]}
                            text={this.props.translate('common.save')}
                            pressOnEnter
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

DebitCardPage.propTypes = propTypes;
DebitCardPage.defaultProps = defaultProps;
DebitCardPage.displayName = 'DebitCardPage';

export default compose(
    withLocalize,
    withOnyx({
    }),
)(DebitCardPage);
