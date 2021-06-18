import React from 'react';
import {View, ScrollView} from 'react-native';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import Navigation from '../../libs/Navigation/Navigation';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import {goToWithdrawalAccountSetupStep} from '../../libs/actions/BankAccounts';
import Button from '../../components/Button';
import FixedFooter from '../../components/FixedFooter';
import IdentityForm from './IdentityForm';

class RequestorStep extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            dob: '',
            ssnLast4: '',
        };
    }

    render() {
        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('requestorStep.headerTitle')}
                    shouldShowBackButton
                    onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <ScrollView style={[styles.flex1, styles.w100]}>
                    <View style={[styles.p4]}>
                        <IdentityForm
                            onFieldChange={(field, value) => this.setState({[field]: value})}
                            values={{
                                firstName: this.state.firstName,
                                lastName: this.state.lastName,
                                street: this.state.street,
                                city: this.state.city,
                                state: this.state.state,
                                zipCode: this.state.zipCode,
                                dob: this.state.dob,
                                ssnLast4: this.state.ssnLast4,
                            }}
                        />
                        <CheckboxWithLabel
                            isChecked={false}
                            onPress={() => {}}
                            LabelComponent={() => (
                                <View style={[styles.flex1, styles.pr1]}>
                                    <Text>
                                        {this.props.translate('requestorStep.isAuthorized')}
                                    </Text>
                                </View>
                            )}
                            style={[styles.mt4]}
                        />
                        <Text style={[styles.textMicroSupporting, styles.mt5]}>
                            {this.props.translate('requestorStep.financialRegulations')}
                            <TextLink
                                size="micro"
                                // eslint-disable-next-line max-len
                                href="https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account"
                            >
                                {`${this.props.translate('requestorStep.learnMore')}`}
                            </TextLink>
                            {' | '}
                            <TextLink
                                size="micro"
                                // eslint-disable-next-line max-len
                                href="https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information"
                            >
                                {`${this.props.translate('requestorStep.isMyDataSafe')}`}
                            </TextLink>
                        </Text>
                        <Text style={[styles.mt3, styles.textMicroSupporting]}>
                            {this.props.translate('requestorStep.onFidoConditions')}
                            <TextLink
                                size="micro"
                                href="https://onfido.com/facial-scan-policy-and-release/"
                            >
                                {`${this.props.translate('requestorStep.onFidoFacialScan')}`}
                            </TextLink>
                            {', '}
                            <TextLink
                                size="micro"
                                href="https://onfido.com/privacy/"
                            >
                                {`${this.props.translate('common.privacyPolicy')}`}
                            </TextLink>
                            {` ${this.props.translate('common.and')} `}
                            <TextLink
                                size="micro"
                                href="https://onfido.com/terms-of-service/"
                            >
                                {`${this.props.translate('common.termsOfService')}`}
                            </TextLink>
                        </Text>
                    </View>
                </ScrollView>
                <FixedFooter style={[styles.mt5]}>
                    <Button
                        success
                        onPress={() => {
                        }}
                        style={[styles.w100]}
                        text={this.props.translate('common.saveAndContinue')}
                    />
                </FixedFooter>
            </>
        );
    }
}

RequestorStep.propTypes = withLocalizePropTypes;
RequestorStep.displayName = 'RequestorStep';

export default withLocalize(RequestorStep);
