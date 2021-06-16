import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import {goToWithdrawalAccountSetupStep} from '../../libs/actions/BankAccounts';
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

const CompanyStep = ({translate}) => (
    <>
        <HeaderWithCloseButton
            title={translate('companyStep.headerTitle')}
            shouldShowBackButton
            onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
            onCloseButtonPress={Navigation.dismissModal}
        />
        <ScrollView style={[styles.flex1, styles.w100]}>
            <View style={[styles.p4]}>
                <View style={[styles.alignItemsCenter]}>
                    <Text>{translate('companyStep.subtitle')}</Text>
                </View>
                <TextInputWithLabel label={translate('companyStep.legalBusinessName')} containerStyles={[styles.mt4]} />
                <TextInputWithLabel label={translate('common.companyAddressNoPO')} containerStyles={[styles.mt4]} />
                <View style={[styles.flexRow, styles.mt4]}>
                    <View style={[styles.flex2, styles.mr2]}>
                        <TextInputWithLabel label={translate('common.city')} />
                    </View>
                    <View style={[styles.flex1]}>
                        <Text style={[styles.formLabel]}>{translate('common.state')}</Text>
                        <StatePicker onChange={() => {}} />
                    </View>
                </View>
                <TextInputWithLabel label={translate('common.zip')} containerStyles={[styles.mt4]} />
                <TextInputWithLabel
                    label={translate('common.phoneNumber')}
                    containerStyles={[styles.mt4]}
                    keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                />
                <TextInputWithLabel label={translate('companyStep.companyWebsite')} containerStyles={[styles.mt4]} />
                <TextInputWithLabel label={translate('companyStep.taxIDNumber')} containerStyles={[styles.mt4]} />
                <Text style={[styles.formLabel, styles.mt4]}>{translate('companyStep.companyType')}</Text>
                <Picker
                    items={_.map(CONST.INCORPORATION_TYPES, (label, value) => ({value, label}))}
                    onChange={() => {}}
                    placeholder={{value: '', label: 'Type'}}
                />
                <View style={[styles.flexRow, styles.mt4]}>
                    <View style={[styles.flex2, styles.mr2]}>
                        <TextInputWithLabel label={translate('companyStep.incorporationDate')} />
                    </View>
                    <View style={[styles.flex1]}>
                        <Text style={[styles.formLabel]}>{translate('common.state')}</Text>
                        <StatePicker onChange={() => {}} />
                    </View>
                </View>
                {/* TODO: incorporation date picker */}
                <TextInputWithLabel
                    label={translate('companyStep.industryClassificationCode')}
                    helpLinkText={translate('common.whatThis')}
                    helpLinkURL="https://www.naics.com/search/"
                    containerStyles={[styles.mt4]}
                />
                <TextInputWithLabel
                    label={`Expensify ${translate('common.password')}`}
                    containerStyles={[styles.mt4]}
                    secureTextEntry
                    autoCompleteType="password"
                    textContentType="password"
                />
                <CheckboxWithLabel
                    isChecked={false}
                    onPress={() => {}}
                    LabelComponent={() => (
                        <>
                            <Text>{`${translate('companyStep.confirmCompanyIsNot')} `}</Text>
                            <TextLink
                                href="https://community.expensify.com/discussion/6191/list-of-restricted-businesses"
                            >
                                {`${translate('companyStep.listOfRestrictedBusinesses')}.`}
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
                onPress={() => {
                }}
                style={[styles.w100]}
                text={translate('common.saveAndContinue')}
            />
        </FixedFooter>
    </>
);

CompanyStep.propTypes = withLocalizePropTypes;
CompanyStep.displayName = 'CompanyStep';

export default withLocalize(CompanyStep);
