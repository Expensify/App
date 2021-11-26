import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import * as Localize from '../../../libs/Localize';
import CONST from '../../../CONST';
import * as Link from '../../../libs/actions/Link';

const termsData = [
    {
        title: Localize.translateLocal('termsStep.monthlyFee'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
    },
    {
        title: Localize.translateLocal('termsStep.shortTermsForm.perPurchase'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
    },
    {
        title: Localize.translateLocal('termsStep.shortTermsForm.atmWithdrawal'),
        subTitle: Localize.translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork'),
        rightText: Localize.translateLocal('common.na'),
    },
    {
        title: Localize.translateLocal('termsStep.shortTermsForm.cashReload'),
        rightText: Localize.translateLocal('common.na'),
    },
    {
        title: Localize.translateLocal('termsStep.shortTermsForm.atmBalanceInquiry'),
        subTitle: Localize.translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork'),
        rightText: Localize.translateLocal('common.na'),
    },
    {
        title: Localize.translateLocal('termsStep.shortTermsForm.customerService'),
        subTitle: Localize.translateLocal('termsStep.shortTermsForm.automatedOrLive'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
    },
    {
        title: Localize.translateLocal('termsStep.inactivity'),
        subTitle: Localize.translateLocal('termsStep.shortTermsForm.afterTwelveMonths'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
    },
];

const getShortTermsSections = () => _.map(termsData, section => (
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
            {Localize.translateLocal('termsStep.shortTermsForm.expensifyPaymentsAccount')}
        </Text>
        <View style={[styles.border, styles.p2, styles.mb6]}>
            {getShortTermsSections()}

            <View style={styles.shortTermsBoldHeadingSection}>
                <Text style={styles.textStrong}>
                    {Localize.translateLocal('termsStep.shortTermsForm.weChargeOneFee')}
                </Text>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{Localize.translateLocal('termsStep.electronicFundsWithdrawal')}</Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {Localize.translateLocal('termsStep.instant')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
                        {Localize.translateLocal('termsStep.electronicFundsInstantFee')}
                    </Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1, styles.textAlignRight]}>
                        {Localize.translateLocal('termsStep.electronicFundsInstantFeeMin')}
                    </Text>
                </View>
            </View>
            <View style={[styles.shortTermsBoldHeadingSection, styles.mb4]}>
                <Text style={[styles.textStrong, styles.mb3]}>
                    {Localize.translateLocal('termsStep.noOverdraftOrCredit')}
                </Text>
                <Text style={styles.mb3}>
                    {Localize.translateLocal('termsStep.shortTermsForm.fdicInsurance')}
                </Text>
                <Text style={styles.mb3}>
                    {Localize.translateLocal('termsStep.shortTermsForm.generalInfo')}
                    {' '}
                    <Text
                        style={styles.link}
                        onPress={() => Link.openExternalLink(CONST.CFPB_PREPAID_URL)}
                    >
                        {CONST.TERMS.CFPB_PREPAID}
                    </Text>
                    .
                </Text>
                <Text>
                    {Localize.translateLocal('termsStep.shortTermsForm.conditionsDetails')}
                    {' '}
                    <Text
                        style={styles.link}
                        onPress={() => Link.openExternalLink(CONST.FEES_URL)}
                    >
                        {CONST.TERMS.USE_EXPENSIFY_FEES}
                    </Text>
                    {' '}
                    {Localize.translateLocal('termsStep.shortTermsForm.conditionsPhone')}
                </Text>
            </View>
        </View>
    </>
);

ShortTermsForm.displayName = 'ShortTermsForm';

export default ShortTermsForm;
