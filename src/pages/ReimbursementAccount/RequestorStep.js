import React from 'react';
import _ from 'underscore';
import {View, TextInput} from 'react-native';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import Navigation from '../../libs/Navigation/Navigation';
import Icon from '../../components/Icon';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import Picker from '../../components/Picker';
import {DownArrow} from '../../components/Icon/Expensicons';
import BankAccount from '../../libs/models/BankAccount';
import Button from '../../components/Button';

const propTypes = {
    ...withLocalizePropTypes,
};

class RequestorStep extends React.Component {
    constructor(props) {
        super(props);

        this.toggleAuthorization = this.toggleAuthorization.bind(this);

        this.state = {
            firstName: '',
            lastName: '',
            requestorAddressStreet: '',
            requestorAddressCity: '',
            requestorAddressState: '',
            requestorAddressZipCode: '',
            dob: '',
            ssnLast4: '',
            isAuthorized: false,
        };
    }

    toggleAuthorization() {
        this.setState(prevState => ({
            isAuthorized: !prevState.isAuthorized,
        }));
    }


    /**
     * Submits the form for the Requestor Step
     */
    submit() {
        if (!this.state.isAuthorized) {
            console.error('Must be authorized for company spend before proceeding');
        }
    }

    render() {
        // Whether or not the form has been completely filled out
        const unfilledFormValues = _.filter(this.state, value => value === '' || value === false);
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title="Requestor Information"
                    shouldShowBackButton
                    onBackButtonPress={() => BankAccount.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <View style={[styles.flex1, styles.m5]}>
                    <View style={styles.flexRow}>
                        <View style={styles.flex1}>
                            <TextInput
                                style={[styles.textInput, styles.mb4]}
                                placeholder={this.props.translate('profilePage.firstName')}
                                value={this.state.firstName}
                                onChangeText={firstName => this.setState({firstName})}
                            />
                        </View>
                        <View style={[styles.flex1, styles.ml2]}>
                            <TextInput
                                style={[styles.textInput, styles.mb4]}
                                placeholder={this.props.translate('profilePage.lastName')}
                                value={this.state.lastName}
                                onChangeText={lastName => this.setState({lastName})}
                            />
                        </View>
                    </View>
                    <View style={styles.mb6}>
                        <TextInput
                            style={[styles.textInput, styles.mb4]}
                            placeholder={this.props.translate('bankAccount.dob')}
                            value={this.state.dob}
                            onChangeText={dob => this.setState({dob})}
                        />
                        <TextInput
                            style={[styles.textInput, styles.mb4]}
                            placeholder={this.props.translate('bankAccount.ssnLast4')}
                            value={this.state.ssnLast4}
                            onChangeText={ssnLast4 => this.setState({ssnLast4})}
                        />
                        <TextInput
                            style={[styles.textInput, styles.mb4]}
                            placeholder={this.props.translate('bankAccount.requestorAddressStreet')}
                            value={this.state.requestorAddressStreet}
                            onChangeText={requestorAddressStreet => this.setState({requestorAddressStreet})}
                        />
                        <View style={styles.flexRow}>
                            <View style={styles.flex1}>
                                <TextInput
                                    style={[styles.textInput, styles.mb4]}
                                    placeholder={this.props.translate('bankAccount.requestorAddressCity')}
                                    value={this.state.requestorAddressCity}
                                    onChangeText={requestorAddressCity => this.setState({requestorAddressCity})}
                                />
                            </View>
                            <View style={[styles.flex1, styles.mb1, styles.ml2]}>
                                <Picker
                                    style={styles.textInput}
                                    onChange={requestorAddressState => this.setState({requestorAddressState})}
                                    items={CONST.BANK_ACCOUNT.STATES.map(state => ({value: state, label: state}))}
                                    placeholder={{
                                        value: '',
                                        label: this.props.translate('bankAccount.requestorAddressState'),
                                    }}
                                    value={this.state.requestorAddressState}
                                    icon={() => <Icon src={DownArrow} />}
                                />
                            </View>
                        </View>
                        <TextInput
                            style={[styles.textInput, styles.mb4]}
                            placeholder={this.props.translate('bankAccount.requestorAddressZipCode')}
                            value={this.state.requestorAddressZipCode}
                            keyboardType="number-pad"
                            onChangeText={requestorAddressZipCode => this.setState({requestorAddressZipCode})}
                        />
                    </View>
                    <CheckboxWithLabel
                        isChecked={this.state.isAuthorized}
                        onPress={this.toggleAuthorization}
                        LabelComponent={() => (
                            <View style={[styles.flexRow, styles.flex1]}>
                                <Text>
                                    {this.props.translate('bankAccount.isAuthorized')}
                                </Text>
                            </View>
                        )}
                    />
                    <Text style={[styles.textMicroSupporting, styles.mt5]}>
                        {this.props.translate('bankAccount.financialRegulations')}
                        {/* eslint-disable-next-line max-len */}
                        <TextLink href="https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account">
                            {`${this.props.translate('bankAccount.learnMore')}`}
                        </TextLink>
                        {' | '}
                        {/* eslint-disable-next-line max-len */}
                        <TextLink href="https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information">
                            {`${this.props.translate('bankAccount.isMyDataSafe')}`}
                        </TextLink>
                    </Text>
                    <Text style={[styles.mt3, styles.textMicroSupporting]}>
                        {this.props.translate('bankAccount.onFidoConditions')}
                        <TextLink href="https://onfido.com/facial-scan-policy-and-release/">
                            {`${this.props.translate('bankAccount.onFidoFacialScan')}`}
                        </TextLink>
                        {', '}
                        <TextLink href="https://onfido.com/privacy/">
                            {`${this.props.translate('common.privacyPolicy')}`}
                        </TextLink>
                        {` ${this.props.translate('common.and')} `}
                        <TextLink href="https://onfido.com/terms-of-service/">
                            {`${this.props.translate('common.termsOfService')}`}
                        </TextLink>
                    </Text>
                </View>
                <Button
                    success
                    text={this.props.translate('common.saveAndContinue')}
                    style={styles.m5}
                    isDisabled={unfilledFormValues.length > 0}
                    onPress={this.submit}
                />
            </View>
        );
    }
}

RequestorStep.propTypes = propTypes;

export default withLocalize(RequestorStep);
