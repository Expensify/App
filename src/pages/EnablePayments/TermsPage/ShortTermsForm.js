import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import ExpensifyText from '../../../components/ExpensifyText';
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
            <ExpensifyText>{section.title}</ExpensifyText>
            {
                section.subTitle
                && (
                    <ExpensifyText style={[styles.textMicroSupporting, styles.mt1]}>
                        {section.subTitle}
                    </ExpensifyText>
                )
            }
        </View>
        <View style={[styles.flex1, styles.termsCenterRight]}>
            <ExpensifyText style={[styles.textStrong, styles.textAlignRight]}>
                {section.rightText}
            </ExpensifyText>
        </View>
    </View>
));

const ShortTermsForm = () => (
    <>
        <ExpensifyText style={styles.mb5}>
            {Localize.translateLocal('termsStep.shortTermsForm.expensifyPaymentsAccount')}
        </ExpensifyText>
        <View style={[styles.border, styles.p2, styles.mb6]}>
            {getShortTermsSections()}

            <View style={styles.shortTermsBoldHeadingSection}>
                <ExpensifyText style={styles.textStrong}>
                    {Localize.translateLocal('termsStep.shortTermsForm.weChargeOneFee')}
                </ExpensifyText>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <ExpensifyText>{Localize.translateLocal('termsStep.electronicFundsWithdrawal')}</ExpensifyText>
                    <ExpensifyText style={[styles.textMicroSupporting, styles.mt1]}>
                        {Localize.translateLocal('termsStep.instant')}
                    </ExpensifyText>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <ExpensifyText style={[styles.textStrong, styles.textAlignRight]}>
                        {Localize.translateLocal('termsStep.electronicFundsInstantFee')}
                    </ExpensifyText>
                    <ExpensifyText style={[styles.textMicroSupporting, styles.mt1, styles.textAlignRight]}>
                        {Localize.translateLocal('termsStep.electronicFundsInstantFeeMin')}
                    </ExpensifyText>
                </View>
            </View>
            <View style={[styles.shortTermsBoldHeadingSection, styles.mb4]}>
                <ExpensifyText style={[styles.textStrong, styles.mb3]}>
                    {Localize.translateLocal('termsStep.noOverdraftOrCredit')}
                </ExpensifyText>
                <ExpensifyText style={styles.mb3}>
                    {Localize.translateLocal('termsStep.shortTermsForm.fdicInsurance')}
                </ExpensifyText>
                <ExpensifyText style={styles.mb3}>
                    {Localize.translateLocal('termsStep.shortTermsForm.generalInfo')}
                    {' '}
                    <ExpensifyText
                        style={styles.link}
                        onPress={() => Link.openExternalLink(CONST.CFPB_PREPAID_URL)}
                    >
                        {CONST.TERMS.CFPB_PREPAID}
                    </ExpensifyText>
                    .
                </ExpensifyText>
                <ExpensifyText>
                    {Localize.translateLocal('termsStep.shortTermsForm.conditionsDetails')}
                    {' '}
                    <ExpensifyText
                        style={styles.link}
                        onPress={() => Link.openExternalLink(CONST.FEES_URL)}
                    >
                        {CONST.TERMS.USE_EXPENSIFY_FEES}
                    </ExpensifyText>
                    {' '}
                    {Localize.translateLocal('termsStep.shortTermsForm.conditionsPhone')}
                </ExpensifyText>
            </View>
        </View>
    </>
);

ShortTermsForm.displayName = 'ShortTermsForm';

export default ShortTermsForm;
