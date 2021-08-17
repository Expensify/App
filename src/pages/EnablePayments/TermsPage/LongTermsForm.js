import React from 'react';
import {View, Linking} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CollapsibleSection from '../../../components/CollapsibleSection';
import {translateLocal} from '../../../libs/translate';
import CONST from '../../../CONST';
import Icon from '../../../components/Icon';
import {Printer} from '../../../components/Icon/Expensicons';

const termsData = [
    {
        title: translateLocal('termsStep.longTermsForm.openingAccountTitle'),
        rightText: translateLocal('termsStep.feeAmountZero'),
        details: translateLocal('termsStep.longTermsForm.openingAccountDetails'),
    },
    {
        title: translateLocal('termsStep.monthlyFee'),
        rightText: translateLocal('termsStep.feeAmountZero'),
        details: translateLocal('termsStep.longTermsForm.monthlyFeeDetails'),
    },
    {
        title: translateLocal('termsStep.longTermsForm.customerServiceTitle'),
        subTitle: translateLocal('termsStep.longTermsForm.automated'),
        rightText: translateLocal('termsStep.feeAmountZero'),
        details: translateLocal('termsStep.longTermsForm.customerServiceDetails'),
    },
    {
        title: translateLocal('termsStep.longTermsForm.customerServiceTitle'),
        subTitle: translateLocal('termsStep.longTermsForm.liveAgent'),
        rightText: translateLocal('termsStep.feeAmountZero'),
        details: translateLocal('termsStep.longTermsForm.customerServiceDetails'),
    },
    {
        title: translateLocal('termsStep.inactivity'),
        rightText: translateLocal('termsStep.feeAmountZero'),
        details: translateLocal('termsStep.longTermsForm.inactivityDetails'),
    },
    {
        title: translateLocal('termsStep.longTermsForm.sendingFundsTitle'),
        rightText: translateLocal('termsStep.feeAmountZero'),
        details: translateLocal('termsStep.longTermsForm.sendingFundsDetails'),
    },
    {
        title: translateLocal('termsStep.electronicFundsWithdrawal'),
        subTitle: translateLocal('termsStep.standard'),
        rightText: translateLocal('termsStep.feeAmountZero'),
        details: translateLocal('termsStep.longTermsForm.electronicFundsStandardDetails'),
    },
    {
        title: translateLocal('termsStep.electronicFundsWithdrawal'),
        subTitle: translateLocal('termsStep.instant'),
        rightText: translateLocal('termsStep.electronicFundsInstantFee'),
        subRightText: translateLocal('termsStep.electronicFundsInstantFeeMin'),
        details: translateLocal('termsStep.longTermsForm.electronicFundsStandardDetails'),
    },
];

const getLongTermsSections = () => termsData.map((section, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <View key={section.title + index}>
        <View style={[styles.longTermsRow]}>
            <View style={[styles.flex4]}>
                <Text>{section.title}</Text>
                {
                    section.subTitle
                    && (
                        <Text style={[styles.textMicroSupporting, styles.mt1]}>
                            {section.subTitle}
                        </Text>
                    )
                }
            </View>
            <View style={[styles.flex1, styles.termsCenterRight]}>
                <Text style={[styles.textStrong, styles.textAlignRight]}>
                    {section.rightText}
                </Text>
                {
                    section.subRightText
                    && (
                        <Text style={[styles.textMicroSupporting, styles.mt1, styles.textAlignRight]}>
                            {section.subRightText}
                        </Text>
                    )
                }
            </View>
        </View>
        <Text style={[styles.textLabelSupporting, styles.mt2]}>
            {section.details}
        </Text>
    </View>
));

const LongTermsForm = () => (
    <>
        <CollapsibleSection title={translateLocal('termsStep.longTermsForm.listOfAllFees')}>
            {getLongTermsSections()}
        </CollapsibleSection>

        <Text style={[styles.mb4, styles.mt6, styles.textMicroSupporting]}>
            {translateLocal('termsStep.longTermsForm.fdicInsuranceBancorp')}
            {' '}
            {CONST.TERMS.FDIC_PREPAID}
            {' '}
            {translateLocal('termsStep.longTermsForm.fdicInsuranceBancorp2')}
        </Text>
        <Text style={[styles.mb4, styles.textMicroSupporting]}>
            {translateLocal('termsStep.noOverdraftOrCredit')}
        </Text>
        <Text style={[styles.mb4, styles.textMicroSupporting]}>
            {translateLocal('termsStep.longTermsForm.contactExpensifyPayments')}
            {' '}
            {CONST.EMAIL.CONCIERGE}
            {' '}
            {translateLocal('termsStep.longTermsForm.contactExpensifyPayments2')}
            {' '}
            {CONST.NEWDOT}
            .
        </Text>
        <Text style={[styles.mb6, styles.textMicroSupporting]}>
            {translateLocal('termsStep.longTermsForm.generalInformation')}
            {' '}
            {CONST.TERMS.CFPB_PREPAID}
            {'. '}
            {translateLocal('termsStep.longTermsForm.generalInformation2')}
            {' '}
            {CONST.TERMS.CFPB_COMPLAINT}
            .
        </Text>

        <View style={styles.flexRow}>
            <Icon style={styles.flex1} src={Printer} />
            <Text
                style={[styles.link, styles.ml1]}
                onPress={() => Linking.openURL(CONST.FEES_URL)}
            >
                {translateLocal('termsStep.longTermsForm.printerFriendlyView')}
            </Text>
        </View>
    </>
);

LongTermsForm.displayName = 'LongTermsForm';
export default LongTermsForm;
