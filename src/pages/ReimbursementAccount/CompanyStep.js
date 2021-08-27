import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View, ScrollView} from 'react-native';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import {
    goToWithdrawalAccountSetupStep, hideBankAccountErrors,
    setBankAccountFormValidationErrors,
    setErrorModalVisible,
    setupWithdrawalAccount,
} from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import FixedFooter from '../../components/FixedFooter';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import StatePicker from '../../components/StatePicker';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {
    isValidAddress, isValidDate, isValidIndustryCode, isValidZipCode,
} from '../../libs/ValidationUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import ExpensiPicker from '../../components/ExpensiPicker';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: PropTypes.shape({
        /** Error set when handling the API response */
        error: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        // this.state = {
        //     companyName: lodashGet(props, ['achData', 'companyName'], ''),
        //     addressStreet: lodashGet(props, ['achData', 'addressStreet'], ''),
        //     addressCity: lodashGet(props, ['achData', 'addressCity'], ''),
        //     addressState: lodashGet(props, ['achData', 'addressState']) || '',
        //     addressZipCode: lodashGet(props, ['achData', 'addressZipCode'], ''),
        //     companyPhone: lodashGet(props, ['achData', 'companyPhone'], ''),
        //     website: lodashGet(props, ['achData', 'website'], 'https://'),
        //     companyTaxID: lodashGet(props, ['achData', 'companyTaxID'], ''),
        //     incorporationType: lodashGet(props, ['achData', 'incorporationType'], ''),
        //     incorporationDate: lodashGet(props, ['achData', 'incorporationDate'], ''),
        //     incorporationState: lodashGet(props, ['achData', 'incorporationState']) || '',
        //     industryCode: lodashGet(props, ['achData', 'industryCode'], ''),
        //     hasNoConnectionToCannabis: lodashGet(props, ['achData', 'hasNoConnectionToCannabis'], false),
        //     password: '',
        // };
        // TODO: Remove this below. It is just handy for testing fast
        this.state = {
            companyName: lodashGet(props, ['achData', 'companyName'], 'Fake company name'),
            addressStreet: lodashGet(props, ['achData', 'addressStreet'], 'Fake address'),
            addressCity: lodashGet(props, ['achData', 'addressCity'], 'Fake City'),
            addressState: lodashGet(props, ['achData', 'addressState']) || 'GA',
            addressZipCode: lodashGet(props, ['achData', 'addressZipCode'], '33'),
            companyPhone: lodashGet(props, ['achData', 'companyPhone'], '33'),
            website: lodashGet(props, ['achData', 'website'], 'https://asdasd.com'),
            companyTaxID: lodashGet(props, ['achData', 'companyTaxID'], '123123123'),
            incorporationType: lodashGet(props, ['achData', 'incorporationType'], 'PARTNERSHIP'),
            incorporationDate: lodashGet(props, ['achData', 'incorporationDate'], '2010-10-10'),
            incorporationState: lodashGet(props, ['achData', 'incorporationState']) || 'GA',
            industryCode: lodashGet(props, ['achData', 'industryCode'], '3'),
            hasNoConnectionToCannabis: lodashGet(props, ['achData', 'hasNoConnectionToCannabis'], true),
            password: 'testPassword',
        };

        // These fields need to be filled out in order to submit the form
        this.requiredFields = [
            'companyName',
            'addressStreet',
            'addressCity',
            'addressState',
            'addressZipCode',
            'website',
            'companyTaxID',
            'incorporationDate',
            'incorporationState',
            'incorporationType',
            'industryCode',
            'password',
        ];
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};
        if (!this.state.password.trim()) {
            errors.companyStepPassword = true;
        }

        if (!isValidAddress(this.state.addressStreet)) {
            errors.companyStepAddressStreet = true;
        }

        if (this.state.addressState === '') {
            errors.companyStepAddressState = true;
        }

        if (!isValidZipCode(this.state.addressZipCode)) {
            errors.companyStepAddressZipCode = true;
        }

        if (!Str.isValidURL(this.state.website)) {
            errors.companyStepWebsite = true;
        }

        if (!/[0-9]{9}/.test(this.state.companyTaxID)) {
            errors.companyStepCompanyTaxID = true;
        }

        if (!isValidDate(this.state.incorporationDate)) {
            errors.companyStepIncorporationDate = true;
        }

        if (!isValidIndustryCode(this.state.industryCode)) {
            errors.companyStepIndustryCode = true;
        }

        if (!this.state.hasNoConnectionToCannabis) {
            errors.companyStepHasNoConnectionToCannabis = true;
        }
        // TODO: set the validation errors outside?
        setBankAccountFormValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    submit() {
        if (!this.validate()) {
            setErrorModalVisible(true);
            return;
        }

        const incorporationDate = moment(this.state.incorporationDate).format(CONST.DATE.MOMENT_FORMAT_STRING);
        setupWithdrawalAccount({...this.state, incorporationDate});
    }

    render() {
        const shouldDisableCompanyName = Boolean(this.props.achData.bankAccountID && this.props.achData.companyName);
        const shouldDisableCompanyTaxID = Boolean(this.props.achData.bankAccountID && this.props.achData.companyTaxID);
        const missingRequiredFields = this.requiredFields.reduce((acc, curr) => acc || !this.state[curr].trim(), false);
        const shouldDisableSubmitButton = !this.state.hasNoConnectionToCannabis || missingRequiredFields;

        const errors = lodashGet(this.props, ['reimbursementAccount', 'errors'], {});
        const getTextChangeHandler = (valueKey, errorKey) => (newValue) => {
            if (errors[errorKey]) {
                setBankAccountFormValidationErrors({});
            }
            this.setState({[valueKey]: newValue});
        };

        const getErrorText = (errorKey, errorTranslateKey) => (errors[errorKey] ? this.props.translate(errorTranslateKey)
            : '');
        console.log('errors', errors); // TODO: remove me!

        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('companyStep.headerTitle')}
                    shouldShowBackButton
                    onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <ScrollView style={[styles.flex1, styles.w100]}>
                    <View style={[styles.p4]}>
                        <Text>{this.props.translate('companyStep.subtitle')}</Text>
                        <ExpensiTextInput
                            label={this.props.translate('companyStep.legalBusinessName')}
                            containerStyles={[styles.mt4]}
                            onChangeText={companyName => this.setState({companyName})}
                            value={this.state.companyName}
                            disabled={shouldDisableCompanyName}
                        />
                        <ExpensiTextInput
                            label={this.props.translate('common.companyAddress')}
                            containerStyles={[styles.mt4]}
                            onChangeText={getTextChangeHandler('addressStreet', 'companyStepAddressStreet')}
                            value={this.state.addressStreet}
                            errorText={getErrorText('companyStepAddressStreet', 'bankAccount.error.addressStreet')}
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt1]}>{this.props.translate('common.noPO')}</Text>
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex2, styles.mr2]}>
                                <ExpensiTextInput
                                    label={this.props.translate('common.city')}
                                    onChangeText={addressCity => this.setState({addressCity})}
                                    value={this.state.addressCity}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <StatePicker
                                    onChange={addressState => this.setState({addressState})}
                                    value={this.state.addressState}
                                />
                            </View>
                        </View>
                        <ExpensiTextInput
                            label={this.props.translate('common.zip')}
                            containerStyles={[styles.mt4]}
                            onChangeText={getTextChangeHandler('addressZipCode', 'companyStepAddressZipCode')}
                            value={this.state.addressZipCode}
                            errorText={getErrorText('companyStepAddressZipCode', 'bankAccount.error.zipCode')}
                        />
                        <ExpensiTextInput
                            label={this.props.translate('common.phoneNumber')}
                            containerStyles={[styles.mt4]}
                            keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                            onChangeText={companyPhone => this.setState({companyPhone})}
                            value={this.state.companyPhone}
                            placeholder={this.props.translate('companyStep.companyPhonePlaceholder')}
                        />
                        <ExpensiTextInput
                            label={this.props.translate('companyStep.companyWebsite')}
                            containerStyles={[styles.mt4]}
                            onChangeText={getTextChangeHandler('website', 'companyStepWebsite')}
                            value={this.state.website}
                            errorText={getErrorText('companyStepWebsite', 'bankAccount.error.website')}
                        />
                        <ExpensiTextInput
                            label={this.props.translate('companyStep.taxIDNumber')}
                            containerStyles={[styles.mt4]}
                            keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                            onChangeText={getTextChangeHandler('companyTaxID', 'companyStepCompanyTaxID')}
                            value={this.state.companyTaxID}
                            disabled={shouldDisableCompanyTaxID}
                            errorText={getErrorText('companyStepCompanyTaxID', 'bankAccount.error.taxID')}
                        />
                        <View style={styles.mt4}>
                            <ExpensiPicker
                                label={this.props.translate('companyStep.companyType')}
                                items={_.map(CONST.INCORPORATION_TYPES, (label, value) => ({value, label}))}
                                onChange={incorporationType => this.setState({incorporationType})}
                                value={this.state.incorporationType}
                                placeholder={{value: '', label: '-'}}
                            />
                        </View>
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex2, styles.mr2]}>
                                {/* TODO: Replace with date picker */}
                                <ExpensiTextInput
                                    label={this.props.translate('companyStep.incorporationDate')}
                                    onChangeText={getTextChangeHandler('incorporationDate', 'companyStepIncorporationDate')}
                                    value={this.state.incorporationDate}
                                    placeholder={this.props.translate('companyStep.incorporationDatePlaceholder')}
                                    errorText={getErrorText('companyStepIncorporationDate', 'bankAccount.error.incorporationDate')}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <StatePicker
                                    onChange={incorporationState => this.setState({incorporationState})}
                                    value={this.state.incorporationState}
                                />
                            </View>
                        </View>
                        {/* TODO: Replace with NAICS picker */}
                        <ExpensiTextInput
                            label={this.props.translate('companyStep.industryClassificationCode')}
                            helpLinkText={this.props.translate('common.whatThis')}
                            helpLinkURL="https://www.naics.com/search/"
                            containerStyles={[styles.mt4]}
                            onChangeText={getTextChangeHandler('industryCode', 'companyStepIndustryCode')}
                            value={this.state.industryCode}
                            errorText={getErrorText('companyStepIndustryCode', 'bankAccount.error.industryCode')}
                        />
                        <ExpensiTextInput
                            label={`Expensify ${this.props.translate('common.password')}`}
                            containerStyles={[styles.mt4]}
                            secureTextEntry
                            textContentType="password"
                            onChangeText={getTextChangeHandler('password', 'companyStepPassword')}
                            value={this.state.password}
                            onSubmitEditing={shouldDisableSubmitButton ? undefined : this.submit}
                            errorText={getErrorText('companyStepPassword', 'common.passwordCannotBeBlank')}

                            // Use new-password to prevent an autoComplete bug https://github.com/Expensify/Expensify/issues/173177
                            // eslint-disable-next-line react/jsx-props-no-multi-spaces
                            autoCompleteType="new-password"
                        />
                        <CheckboxWithLabel
                            isChecked={this.state.hasNoConnectionToCannabis}
                            onPress={() => this.setState(prevState => ({
                                hasNoConnectionToCannabis: !prevState.hasNoConnectionToCannabis,
                            }))}
                            LabelComponent={() => (
                                <>
                                    <Text>{`${this.props.translate('companyStep.confirmCompanyIsNot')} `}</Text>
                                    <TextLink
                                        // eslint-disable-next-line max-len
                                        href="https://community.expensify.com/discussion/6191/list-of-restricted-businesses"
                                    >
                                        {`${this.props.translate('companyStep.listOfRestrictedBusinesses')}.`}
                                    </TextLink>
                                </>
                            )}
                            style={[styles.mt4]}
                        />
                    </View>
                </ScrollView>
                <FixedFooter style={[styles.mt5]}>
                    <Button
                        success
                        onPress={this.submit}
                        style={[styles.w100]}
                        text={this.props.translate('common.saveAndContinue')}
                        isDisabled={shouldDisableSubmitButton}
                    />
                </FixedFooter>
            </>
        );
    }
}

CompanyStep.propTypes = propTypes;
export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(CompanyStep);
