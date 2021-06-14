import React from 'react';
import {View, TextInput} from 'react-native';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import Navigation from '../../libs/Navigation/Navigation';
import Icon from '../../components/Icon';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import Picker from '../../components/Picker';
import {DownArrow} from '../../components/Icon/Expensicons';
import BankAccount from '../../libs/models/BankAccount';

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
            street: '',
            city: '',
            state: '',
            zipCode: '',
            dob: '',
            ssn: '',
        };
    }

    toggleAuthorization() {
        this.setState(prevState => ({
            isAuthorized: !prevState.isAuthorized,
        }));
    }

    render() {
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title="Requestor Information"
                    shouldShowBackButton
                    onBackButtonPress={() => BankAccount.goToWithdrawalStepID(CONST.BANK_ACCOUNT.STEP.REQUESTOR)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <View style={[styles.m5, styles.flex1]}>
                    <Text style={[styles.loginTermsText]}>
                        {this.props.translate('bankAccount.financialRegulations')}
                        <TextLink
                            href="https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account"
                            style={styles.mb5}
                        >
                            {`${this.props.translate('bankAccount.learnMore')}`}
                        </TextLink>
                        {' | '}
                        <TextLink
                            href="https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information"
                            style={styles.mb5}
                        >
                            {`${this.props.translate('bankAccount.isMyDataSafe')}`}
                        </TextLink>
                    </Text>
                    <Text style={[styles.mb5, styles.loginTermsText]}>
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
                    <View style={[styles.flexRow, styles.mb6]}>
                        <View style={styles.flex1}>
                            <TextInputWithLabel
                                label={this.props.translate('profilePage.firstName')}
                                value={this.state.firstName}
                                onChangeText={firstName => this.setState({firstName})}
                            />
                        </View>
                        <View style={[styles.flex1, styles.ml2]}>
                            <TextInputWithLabel
                                label={this.props.translate('profilePage.lastName')}
                                value={this.state.lastName}
                                onChangeText={lastName => this.setState({lastName})}
                            />
                        </View>
                    </View>
                    <View style={styles.mb6}>
                        <TextInputWithLabel
                            label={this.props.translate('bankAccount.personalAddress')}
                            placeholder={this.props.translate('bankAccount.street')}
                            value={this.state.street}
                            onChangeText={street => this.setState({street})}
                        />
                        <TextInput
                            style={[styles.textInput, styles.mb2]}
                            placeholder={this.props.translate('bankAccount.city')}
                            value={this.state.city}
                            onChangeText={city => this.setState({city})}
                        />
                        <View style={styles.flexRow}>
                            <View style={[styles.flex1, styles.mb1]}>
                                <Picker
                                    style={styles.textInput}
                                    onChange={state => this.setState({state})}
                                    items={CONST.BANK_ACCOUNT.STATES.map(state => ({value: state, label: state}))}
                                    placeholder={{
                                        value: '',
                                        label: this.props.translate('bankAccount.state'),
                                    }}
                                    value={this.state.state}
                                    icon={() => <Icon src={DownArrow} />}
                                />
                            </View>
                            <View style={[styles.flex1, styles.ml2]}>
                                <TextInput
                                    style={[styles.textInput, styles.mb2]}
                                    placeholder={this.props.translate('bankAccount.zipCode')}
                                    value={this.state.zipCode}
                                    keyboardType="number-pad"
                                    onChangeText={zipCode => this.setState({zipCode})}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.mb6}>
                        <TextInputWithLabel
                            label={this.props.translate('bankAccount.dob')}
                            placeholder="YYYY-MM-DD"
                            value={this.state.dob}
                            onChangeText={dob => this.setState({dob})}
                        />
                    </View>
                    <View style={styles.mb6}>
                        <TextInputWithLabel
                            label={this.props.translate('bankAccount.ssn')}
                            placeholder={this.props.translate('bankAccount.ssnPlaceholder')}
                            value={this.state.ssn}
                            onChangeText={ssn => this.setState({ssn})}
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
                </View>
            </View>
        );
    }
}

RequestorStep.propTypes = propTypes;

export default withLocalize(RequestorStep);
