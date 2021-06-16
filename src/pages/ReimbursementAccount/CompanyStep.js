import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import {goToWithdrawalAccountSetupStep, setupWithdrawalAccount} from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import FixedFooter from '../../components/FixedFooter';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import Picker from '../../components/Picker';
import StatePicker from '../../components/StatePicker';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            companyName: '',
            addressStreet: '',
            addressCity: '',
            addressState: '',
            addressZipCode: '',
            companyPhone: '',
            website: '',
            companyTaxID: '',
            incorporationType: '',
            incorporationDate: '',
            incorporationState: '',
            industryCode: '',
            password: '',
            hasNoConnectionToCannabis: false,
        };
    }

    validate() {

    }

    submit() {
        if (!this.validate()) {
            // @Todo implement and show any errors
            return;
        }

        setupWithdrawalAccount({...this.state});
    }

    render() {
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
                        <View style={[styles.alignItemsCenter]}>
                            <Text>{this.props.translate('companyStep.subtitle')}</Text>
                        </View>
                        <TextInputWithLabel
                            label={this.props.translate('companyStep.legalBusinessName')}
                            containerStyles={[styles.mt4]}
                            onChange={companyName => this.setState({companyName})}
                            value={this.state.companyName}
                        />
                        <TextInputWithLabel
                            label={this.props.translate('common.companyAddressNoPO')}
                            containerStyles={[styles.mt4]}
                            onChange={addressStreet => this.setState({addressStreet})}
                            value={this.state.addressStreet}
                        />
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex2, styles.mr2]}>
                                <TextInputWithLabel
                                    label={this.props.translate('common.city')}
                                    onChange={addressCity => this.setState({addressCity})}
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
                        <TextInputWithLabel
                            label={this.props.translate('common.zip')}
                            containerStyles={[styles.mt4]}
                            onChange={addressZipCode => this.setState({addressZipCode})}
                            value={this.state.addressZipCode}
                        />
                        <TextInputWithLabel
                            label={this.props.translate('common.phoneNumber')}
                            containerStyles={[styles.mt4]}
                            keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                            onChange={companyPhone => this.setState({companyPhone})}
                            value={this.state.companyPhone}
                        />
                        <TextInputWithLabel
                            label={this.props.translate('companyStep.companyWebsite')}
                            containerStyles={[styles.mt4]}
                            onChange={website => this.setState({website})}
                            value={this.state.website}
                        />
                        <TextInputWithLabel
                            label={this.props.translate('companyStep.taxIDNumber')}
                            containerStyles={[styles.mt4]}
                            keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                            onChange={companyTaxID => this.setState({companyTaxID})}
                            value={this.state.companyTaxID}
                        />
                        <Text style={[styles.formLabel, styles.mt4]}>
                            {this.props.translate('companyStep.companyType')}
                        </Text>
                        <Picker
                            items={_.map(CONST.INCORPORATION_TYPES, (label, value) => ({value, label}))}
                            onChange={incorporationType => this.setState({incorporationType})}
                            value={this.state.incorporationType}
                            placeholder={{value: '', label: 'Type'}}
                        />
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex2, styles.mr2]}>
                                {/* TODO: Replace with date picker */}
                                <TextInputWithLabel
                                    label={this.props.translate('companyStep.incorporationDate')}
                                    onChange={incorporationDate => this.setState({incorporationDate})}
                                    value={this.state.incorporationDate}
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
                        <TextInputWithLabel
                            label={this.props.translate('companyStep.industryClassificationCode')}
                            helpLinkText={this.props.translate('common.whatThis')}
                            helpLinkURL="https://www.naics.com/search/"
                            containerStyles={[styles.mt4]}
                            onChange={industryCode => this.setState({industryCode})}
                            value={this.state.industryCode}
                        />
                        <TextInputWithLabel
                            label={`Expensify ${this.props.translate('common.password')}`}
                            containerStyles={[styles.mt4]}
                            secureTextEntry
                            autoCompleteType="password"
                            textContentType="password"
                            onChange={password => this.setState({password})}
                            value={this.state.password}
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
                    />
                </FixedFooter>
            </>
        );
    }
}

CompanyStep.propTypes = withLocalizePropTypes;

export default withLocalize(CompanyStep);
