import React from 'react';
import {View, Linking} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import {translateLocal} from '../../../libs/translate';
import CONST from '../../../CONST';

const termsData = [
    {
        title: translateLocal('termsStep.monthlyFee'),
        rightText: translateLocal('termsStep.feeAmountZero'),
    },
    {
        title: translateLocal('termsStep.shortTermsForm.perPurchase'),
        rightText: translateLocal('termsStep.feeAmountZero'),
    },
    {
        title: translateLocal('termsStep.shortTermsForm.atmWithdrawal'),
        subTitle: translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork'),
        rightText: translateLocal('common.na'),
    },
    {
        title: translateLocal('termsStep.shortTermsForm.cashReload'),
        rightText: translateLocal('common.na'),
    },
    {
        title: translateLocal('termsStep.shortTermsForm.atmBalanceInquiry'),
        subTitle: translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork'),
        rightText: translateLocal('common.na'),
    },
    {
        title: translateLocal('termsStep.shortTermsForm.customerService'),
        subTitle: translateLocal('termsStep.shortTermsForm.automatedOrLive'),
        rightText: translateLocal('termsStep.feeAmountZero'),
    },
    {
        title: translateLocal('termsStep.inactivity'),
        subTitle: translateLocal('termsStep.shortTermsForm.afterTwelveMonths'),
        rightText: translateLocal('termsStep.feeAmountZero'),
    },
];

const getShortTermsSections = () => termsData.map(section => (
    <View style={styles.shortTermsRow} key={section.title}>
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
        </View>
    </View>
));

const ShortTermsForm = () => (
    <>
        <Text style={styles.mb5}>
            {translateLocal('termsStep.shortTermsForm.expensifyPaymentsAccount')}
        </Text>
        <View style={[styles.border, styles.p2, styles.mb6]}>
            {getShortTermsSections()}

            <View style={styles.shortTermsBoldHeadingSection}>
                <Text style={styles.textStrong}>
                    {translateLocal('termsStep.shortTermsForm.weChargeOneFee')}
                </Text>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.electronicFundsWithdrawal')}</Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {translateLocal('termsStep.instant')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
                        {translateLocal('termsStep.electronicFundsInstantFee')}
                    </Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1, styles.textAlignRight]}>
                        {translateLocal('termsStep.electronicFundsInstantFeeMin')}
                    </Text>
                </View>
            </View>
            <View style={[styles.shortTermsBoldHeadingSection, styles.mb4]}>
                <Text style={[styles.textStrong, styles.mb3]}>
                    {translateLocal('termsStep.noOverdraftOrCredit')}
                </Text>
                <Text style={styles.mb3}>
                    {translateLocal('termsStep.shortTermsForm.fdicInsurance')}
                </Text>
                <Text style={styles.mb3}>
                    {translateLocal('termsStep.shortTermsForm.generalInfo')}
                    {' '}
                    <Text
                        style={styles.link}
                        onPress={() => Linking.openURL(CONST.CFPB_PREPAID_URL)}
                    >
                        cfpb.gov/prepaid
                    </Text>
                    .
                </Text>
                <Text>
                    {translateLocal('termsStep.shortTermsForm.conditionsDetails')}
                    {' '}
                    <Text
                        style={styles.link}
                        onPress={() => Linking.openURL(CONST.FEES_URL)}
                    >
                        use.expensify.com/fees
                    </Text>
                    {' '}
                    {translateLocal('termsStep.shortTermsForm.conditionsPhone')}
                </Text>
            </View>
        </View>
    </>
);

ShortTermsForm.displayName = 'ShortTermsForm';

export default ShortTermsForm;
