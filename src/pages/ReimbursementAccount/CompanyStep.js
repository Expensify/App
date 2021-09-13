import _ from 'underscore';
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
    setupWithdrawalAccount,
    showBankAccountFormValidationError,
    showBankAccountErrorModal,
    updateReimbursementAccountDraft, setBankAccountFormValidationErrors,
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
import {getDefaultStateForField} from '../../libs/ReimbursementAccountUtils';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: PropTypes.shape({
        /** Errors set when handling the API response */
        errors: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            companyName: getDefaultStateForField(props, 'companyName'),
            addressStreet: getDefaultStateForField(props, 'addressStreet'),
            addressCity: getDefaultStateForField(props, 'addressCity'),
            addressState: getDefaultStateForField(props, 'addressState'),
            addressZipCode: getDefaultStateForField(props, 'addressZipCode'),
            companyPhone: getDefaultStateForField(props, 'companyPhone'),
            website: getDefaultStateForField(props, 'website', 'https://'),
            companyTaxID: getDefaultStateForField(props, 'companyTaxID'),
            incorporationType: getDefaultStateForField(props, 'incorporationType'),
            incorporationDate: getDefaultStateForField(props, 'incorporationDate'),
            incorporationState: getDefaultStateForField(props, 'incorporationState'),
            industryCode: getDefaultStateForField(props, 'industryCode'),
            hasNoConnectionToCannabis: getDefaultStateForField(props, 'hasNoConnectionToCannabis', false),
            password: '',
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
            'companyPhone',
        ];
    }

    /**
    * @param {String} value
    */
    setValue(value) {
        this.setState(value);
        updateReimbursementAccountDraft(value);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = [];
        if (!this.state.companyName.trim()) {
            errors.push(this.props.translate('bankAccount.error.legalBusinessName'));
        }

        if (!this.state.password.trim()) {
            errors.push(this.props.translate('common.passwordCannotBeBlank'));
        }

        if (!isValidAddress(this.state.addressStreet)) {
            errors.push(this.props.translate('bankAccount.error.addressStreet'));
        }

        if (this.state.addressState === '') {
            errors.push(this.props.translate('bankAccount.error.addressState'));
        }

        if (!isValidZipCode(this.state.addressZipCode)) {
            errors.push(this.props.translate('bankAccount.error.zipCode'));
        }

        if (!Str.isValidURL(this.state.website)) {
            errors.push(this.props.translate('bankAccount.error.website'));
        }

        if (!/[0-9]{9}/.test(this.state.companyTaxID)) {
            errors.push(this.props.translate('bankAccount.error.taxID'));
        }

        if (!isValidDate(this.state.incorporationDate)) {
            errors.push(this.props.translate('bankAccount.error.incorporationDate'));
        }

        if (!isValidIndustryCode(this.state.industryCode)) {
            errors.push(this.props.translate('bankAccount.error.industryCode'));
        }

        if (!this.state.hasNoConnectionToCannabis) {
            errors.push(this.props.translate('bankAccount.error.restrictedBusiness'));
        }

        setBankAccountFormValidationErrors(errors);
        return !errors.length;
    }

    submit() {
        if (!this.validate()) {
            showBankAccountErrorModal();
            return;
        }

        const incorporationDate = moment(this.state.incorporationDate).format(CONST.DATE.MOMENT_FORMAT_STRING);
        setupWithdrawalAccount({...this.state, incorporationDate});
    }

    render() {
        const shouldDisableCompanyName = Boolean(this.props.achData.bankAccountID && this.props.achData.companyName);
        const shouldDisableCompanyTaxID = Boolean(this.props.achData.bankAccountID && this.props.achData.companyTaxID);
        const shouldDisableSubmitButton = !this.state.hasNoConnectionToCannabis;
        const errors = this.props.reimbursementAccount.errors;

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
                            onChangeText={(companyName) => {
                                if (errors && errors.includes(this.props.translate('bankAccount.error.legalBusinessName'))) {
                                    hideBankAccountErrors();
                                }
                                this.setValue({companyName});
                            }}
                            value={this.state.companyName}
                            disabled={shouldDisableCompanyName}
                            errorText={errors && errors.includes(this.props.translate('bankAccount.error.legalBusinessName'))
                                ? this.props.translate('bankAccount.error.legalBusinessName')
                                : ''}
                        />
                        <ExpensiTextInput
                            label={this.props.translate('common.companyAddress')}
                            containerStyles={[styles.mt4]}
                            onChangeText={(addressStreet) => {
                                if (errors && errors.includes(this.props.translate('bankAccount.error.addressStreet'))) {
                                    hideBankAccountErrors();
                                }
                                this.setValue({addressStreet});
                            }}
                            value={this.state.addressStreet}
                            errorText={errors && errors.includes(this.props.translate('bankAccount.error.addressStreet'))
                                ? this.props.translate('bankAccount.error.addressStreet')
                                : ''}
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt1]}>{this.props.translate('common.noPO')}</Text>
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex2, styles.mr2]}>
                                <ExpensiTextInput
                                    label={this.props.translate('common.city')}
                                    onChangeText={addressCity => this.setValue({addressCity})}
                                    value={this.state.addressCity}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <StatePicker
                                    onChange={addressState => this.setValue({addressState})}
                                    value={this.state.addressState}
                                />
                            </View>
                        </View>
                        <ExpensiTextInput
                            label={this.props.translate('common.zip')}
                            containerStyles={[styles.mt4]}
                            onChangeText={(addressZipCode) => {
                                if (errors && errors.includes(this.props.translate('bankAccount.error.zipCode'))) {
                                    hideBankAccountErrors();
                                }
                                this.setValue({addressZipCode});
                            }}
                            value={this.state.addressZipCode}
                            errorText={errors && errors.includes(this.props.translate('bankAccount.error.zipCode'))
                                ? this.props.translate('bankAccount.error.zipCode')
                                : ''}
                        />
                        <ExpensiTextInput
                            label={this.props.translate('common.phoneNumber')}
                            containerStyles={[styles.mt4]}
                            keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                            onChangeText={companyPhone => this.setValue({companyPhone})}
                            value={this.state.companyPhone}
                            placeholder={this.props.translate('companyStep.companyPhonePlaceholder')}
                        />
                        <ExpensiTextInput
                            label={this.props.translate('companyStep.companyWebsite')}
                            containerStyles={[styles.mt4]}
                            onChangeText={(website) => {
                                if (errors && errors.includes(this.props.translate('bankAccount.error.website'))) {
                                    hideBankAccountErrors();
                                }
                                this.setValue({website});
                            }}
                            value={this.state.website}
                            errorText={errors && errors.includes(this.props.translate('bankAccount.error.website'))
                                ? this.props.translate('bankAccount.error.website')
                                : ''}
                        />
                        <ExpensiTextInput
                            label={this.props.translate('companyStep.taxIDNumber')}
                            containerStyles={[styles.mt4]}
                            keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                            onChangeText={(companyTaxID) => {
                                if (errors && errors.includes(this.props.translate('bankAccount.error.taxID'))) {
                                    hideBankAccountErrors();
                                }
                                this.setValue({companyTaxID});
                            }}
                            value={this.state.companyTaxID}
                            disabled={shouldDisableCompanyTaxID}
                            errorText={errors && errors.includes(this.props.translate('bankAccount.error.taxID'))
                                ? this.props.translate('bankAccount.error.taxID')
                                : ''}
                        />
                        <View style={styles.mt4}>
                            <ExpensiPicker
                                label={this.props.translate('companyStep.companyType')}
                                items={_.map(CONST.INCORPORATION_TYPES, (label, value) => ({value, label}))}
                                onChange={incorporationType => this.setValue({incorporationType})}
                                value={this.state.incorporationType}
                                placeholder={{value: '', label: '-'}}
                            />
                        </View>
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex2, styles.mr2]}>
                                {/* TODO: Replace with date picker */}
                                <ExpensiTextInput
                                    label={this.props.translate('companyStep.incorporationDate')}
                                    onChangeText={(incorporationDate) => {
                                        if (errors && errors.includes(this.props.translate('bankAccount.error.incorporationDate'))) {
                                            hideBankAccountErrors();
                                        }
                                        this.setValue({incorporationDate});
                                    }}
                                    value={this.state.incorporationDate}
                                    placeholder={this.props.translate('companyStep.incorporationDatePlaceholder')}
                                    errorText={errors && errors.includes(this.props.translate('bankAccount.error.incorporationDate'))
                                        ? this.props.translate('bankAccount.error.incorporationDate')
                                        : ''}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <StatePicker
                                    onChange={incorporationState => this.setValue({incorporationState})}
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
                            onChangeText={(industryCode) => {
                                if (errors && errors.includes(this.props.translate('bankAccount.error.industryCode'))) {
                                    hideBankAccountErrors();
                                }
                                this.setValue({industryCode});
                            }}
                            value={this.state.industryCode}
                            errorText={errors && errors.includes(this.props.translate('bankAccount.error.industryCode'))
                                ? this.props.translate('bankAccount.error.industryCode')
                                : ''}
                        />
                        <ExpensiTextInput
                            label={`Expensify ${this.props.translate('common.password')}`}
                            containerStyles={[styles.mt4]}
                            secureTextEntry
                            textContentType="password"
                            onChangeText={(password) => {
                                if (errors && errors.includes(this.props.translate('common.passwordCannotBeBlank'))) {
                                    hideBankAccountErrors();
                                }
                                this.setState({password});
                            }}
                            value={this.state.password}
                            onSubmitEditing={shouldDisableSubmitButton ? undefined : this.submit}
                            errorText={errors && errors.includes(this.props.translate('common.passwordCannotBeBlank'))
                                ? this.props.translate('common.passwordCannotBeBlank')
                                : ''}

                            // Use new-password to prevent an autoComplete bug https://github.com/Expensify/Expensify/issues/173177
                            // eslint-disable-next-line react/jsx-props-no-multi-spaces
                            autoCompleteType="new-password"
                        />
                        <CheckboxWithLabel
                            isChecked={this.state.hasNoConnectionToCannabis}
                            onPress={() => this.setState((prevState) => {
                                const newState = {hasNoConnectionToCannabis: !prevState.hasNoConnectionToCannabis};
                                updateReimbursementAccountDraft(newState);
                                return newState;
                            })}
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
                <FixedFooter>
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
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
    }),
)(CompanyStep);
