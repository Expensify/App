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
import StatePicker from '../../components/StatePicker';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import FixedFooter from '../../components/FixedFooter';

const RequestorStep = ({translate}) => (
    <>
        <HeaderWithCloseButton
            title={translate('requestorStep.headerTitle')}
            shouldShowBackButton
            onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
            onCloseButtonPress={Navigation.dismissModal}
        />
        <ScrollView style={[styles.flex1, styles.w100]}>
            <View style={[styles.p4]}>
                <View style={[styles.flexRow]}>
                    <View style={[styles.flex2, styles.mr2]}>
                        <TextInputWithLabel label={`${translate('common.firstName')}`} />
                    </View>
                    <View style={[styles.flex2]}>
                        <TextInputWithLabel label={`${translate('common.lastName')}`} />
                    </View>
                </View>
                <TextInputWithLabel label={`${translate('common.dob')}`} containerStyles={[styles.mt4]} />
                <TextInputWithLabel label={`${translate('requestorStep.ssnLast4')}`} containerStyles={[styles.mt4]} />
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
                <CheckboxWithLabel
                    isChecked={false}
                    onPress={() => {}}
                    LabelComponent={() => (
                        <View style={[styles.flex1, styles.pr1]}>
                            <Text>
                                {translate('requestorStep.isAuthorized')}
                            </Text>
                        </View>
                    )}
                    style={[styles.mt4]}
                />
                <Text style={[styles.textMicroSupporting, styles.mt5]}>
                    {translate('requestorStep.financialRegulations')}
                    {/* eslint-disable-next-line max-len */}
                    <TextLink href="https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account">
                        {`${translate('requestorStep.learnMore')}`}
                    </TextLink>
                    {' | '}
                    {/* eslint-disable-next-line max-len */}
                    <TextLink href="https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information">
                        {`${translate('requestorStep.isMyDataSafe')}`}
                    </TextLink>
                </Text>
                <Text style={[styles.mt3, styles.textMicroSupporting]}>
                    {translate('requestorStep.onFidoConditions')}
                    <TextLink href="https://onfido.com/facial-scan-policy-and-release/">
                        {`${translate('requestorStep.onFidoFacialScan')}`}
                    </TextLink>
                    {', '}
                    <TextLink href="https://onfido.com/privacy/">
                        {`${translate('common.privacyPolicy')}`}
                    </TextLink>
                    {` ${translate('common.and')} `}
                    <TextLink href="https://onfido.com/terms-of-service/">
                        {`${translate('common.termsOfService')}`}
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
                text={translate('common.saveAndContinue')}
            />
        </FixedFooter>
    </>
);

RequestorStep.propTypes = withLocalizePropTypes;
RequestorStep.displayName = 'RequestorStep';

export default withLocalize(RequestorStep);
