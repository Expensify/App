import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View, ScrollView} from 'react-native';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import {goToWithdrawalAccountSetupStep, setupWithdrawalAccount} from '../../libs/actions/BankAccounts';
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
import ConfirmModal from '../../components/ConfirmModal';
import ExpensiPicker from '../../components/ExpensiPicker';

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            companyName: lodashGet(props, ['achData', 'companyName'], ''),
            addressStreet: lodashGet(props, ['achData', 'addressStreet'], ''),
            addressCity: lodashGet(props, ['achData', 'addressCity'], ''),
            addressState: lodashGet(props, ['achData', 'addressState']) || '',
            addressZipCode: lodashGet(props, ['achData', 'addressZipCode'], ''),
            companyPhone: lodashGet(props, ['achData', 'companyPhone'], ''),
            website: lodashGet(props, ['achData', 'website'], 'https://'),
            companyTaxID: lodashGet(props, ['achData', 'companyTaxID'], ''),
            incorporationType: lodashGet(props, ['achData', 'incorporationType'], ''),
            incorporationDate: lodashGet(props, ['achData', 'incorporationDate'], ''),
            incorporationState: lodashGet(props, ['achData', 'incorporationState']) || '',
            industryCode: lodashGet(props, ['achData', 'industryCode'], ''),
            hasNoConnectionToCannabis: lodashGet(props, ['achData', 'hasNoConnectionToCannabis'], false),
            password: '',
            isConfirmModalOpen: false,
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
            'industryCode',
            'password',
        ];
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        if (!this.state.password.trim()) {
            return false;
        }

        if (!isValidAddress(this.state.addressStreet)) {
            return false;
        }

        if (this.state.addressState === '') {
            return false;
        }

        if (!isValidZipCode(this.state.addressZipCode)) {
            return false;
        }

        if (!Str.isValidURL(this.state.website)) {
            return false;
        }

        if (!/[0-9]{9}/.test(this.state.companyTaxID)) {
            return false;
        }

        if (!isValidDate(this.state.incorporationDate)) {
            return false;
        }

        if (!isValidIndustryCode(this.state.industryCode)) {
            return false;
        }

        if (!this.state.hasNoConnectionToCannabis) {
            return false;
        }

        return true;
    }

    submit() {
        if (!this.validate()) {
            this.setState({isConfirmModalOpen: true});
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
                            label={this.props.translate('common.companyAddressNoPO')}
                            containerStyles={[styles.mt4]}
                            onChangeText={addressStreet => this.setState({addressStreet})}
                            value={this.state.addressStreet}
                        />
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex2, styles.mr2]}>
                                <ExpensiTextInput
                                    label={this.props.translate('common.city')}
                                    onChangeText={addressCity => this.setState({addressCity})}
                                    value={this.state.addressCity}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <Text style={[styles.formLabel]}>{this.props.translate('common.state')}</Text>
                                <StatePicker
                                    onChange={addressState => this.setState({addressState})}
                                    value={this.state.addressState}
                                />
                            </View>
                        </View>
                        <ExpensiTextInput
                            label={this.props.translate('common.zip')}
                            containerStyles={[styles.mt4]}
                            onChangeText={addressZipCode => this.setState({addressZipCode})}
                            value={this.state.addressZipCode}
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
                            onChangeText={website => this.setState({website})}
                            value={this.state.website}
                        />
                        <ExpensiTextInput
                            label={this.props.translate('companyStep.taxIDNumber')}
                            containerStyles={[styles.mt4]}
                            keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                            onChangeText={companyTaxID => this.setState({companyTaxID})}
                            value={this.state.companyTaxID}
                            disabled={shouldDisableCompanyTaxID}
                        />
                        <View style={styles.mt4}>
                            <ExpensiPicker
                                label={this.props.translate('companyStep.companyType')}
                                items={_.map(CONST.INCORPORATION_TYPES, (label, value) => ({value, label}))}
                                onChange={incorporationType => this.setState({incorporationType})}
                                value={this.state.incorporationType}
                                placeholder={{value: '', label: 'Type'}}
                            />
                        </View>
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex2, styles.mr2]}>
                                {/* TODO: Replace with date picker */}
                                <ExpensiTextInput
                                    label={this.props.translate('companyStep.incorporationDate')}
                                    onChangeText={incorporationDate => this.setState({incorporationDate})}
                                    value={this.state.incorporationDate}
                                    placeholder={this.props.translate('companyStep.incorporationDatePlaceholder')}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <Text style={[styles.formLabel]}>{this.props.translate('common.state')}</Text>
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
                            onChangeText={industryCode => this.setState({industryCode})}
                            value={this.state.industryCode}
                        />
                        <ExpensiTextInput
                            autoCompleteType="new-password"
                            label={`Expensify ${this.props.translate('common.password')}`}
                            containerStyles={[styles.mt4]}
                            secureTextEntry
                            textContentType="password"
                            onChangeText={password => this.setState({password})}
                            value={this.state.password}
                            onSubmitEditing={this.submit}
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
                <ConfirmModal
                    title="Oops something went wrong!"
                    onConfirm={() => this.setState({isConfirmModalOpen: false})}
                    prompt="Please double check any highlighted fields and try again."
                    isVisible={this.state.isConfirmModalOpen}
                    confirmText="Got it"
                    shouldShowCancelButton={false}
                />

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

CompanyStep.propTypes = withLocalizePropTypes;

export default withLocalize(CompanyStep);
