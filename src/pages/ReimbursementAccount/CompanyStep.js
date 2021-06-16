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
    <ScrollView style={[styles.flex1, styles.w100]}>
        <HeaderWithCloseButton
            title="Company Information"
            shouldShowBackButton
            onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
            onCloseButtonPress={Navigation.dismissModal}
        />
        <View style={[styles.p4]}>
            <View style={[styles.alignItemsCenter]}>
                <Text>Provide more information about your company.</Text>
            </View>
            <TextInputWithLabel label="Legal Business Name" containerStyles={[styles.mt4]} />
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
            <TextInputWithLabel label="Company Website" containerStyles={[styles.mt4]} />
            <TextInputWithLabel label="Tax ID Number" containerStyles={[styles.mt4]} />
            <Text style={[styles.formLabel, styles.mt4]}>Company Type</Text>
            <Picker
                items={_.map(CONST.INCORPORATION_TYPES, (label, value) => ({value, label}))}
                onChange={() => {}}
                placeholder={{value: '', label: 'Type'}}
            />
            <View style={[styles.flexRow, styles.mt4]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <TextInputWithLabel label="Incorporation Date" />
                </View>
                <View style={[styles.flex1]}>
                    <Text style={[styles.formLabel]}>State</Text>
                    <StatePicker onChange={() => {}} />
                </View>
            </View>
            {/* TODO: incorporation date picker */}
            <TextInputWithLabel
                label="Industry Classification Code"
                linkText={translate('common.whatThis')}
                linkURL="https://www.naics.com/search/"
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
                        <Text>I confirm that this company is not on the </Text>
                        <TextLink href="https://community.expensify.com/discussion/6191/list-of-restricted-businesses">
                            list of restricted businesses.
                        </TextLink>
                    </>
                )}
                style={[styles.mt4]}
            />
        </View>
        <FixedFooter style={[styles.mt5]}>
            <Button
                success
                onPress={() => {
                }}
                style={[styles.w100]}
                text={translate('common.saveAndContinue')}
            />
        </FixedFooter>
    </ScrollView>
);

CompanyStep.propTypes = withLocalizePropTypes;
CompanyStep.displayName = 'CompanyStep';

export default withLocalize(CompanyStep);
