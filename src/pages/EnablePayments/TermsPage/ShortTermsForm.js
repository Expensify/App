import React from 'react';
import {View, Linking} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import {translateLocal} from '../../../libs/translate';
import CONST from '../../../CONST';

const ShortTermsForm = () => (
    <>
        <Text style={styles.mb5}>
            {translateLocal('termsStep.shortTermsForm.expensifyPaymentsAccount')}
        </Text>
        <View style={[styles.border, styles.p2, styles.mb6]}>
            <View style={[styles.shortTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.monthlyFee')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <View style={[styles.shortTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.perPurchase')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.atmWithdrawal')}</Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('common.na')}
                    </Text>
                </View>
            </View>
            <View style={[styles.shortTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.cashReload')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('common.na')}
                    </Text>
                </View>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.atmBalanceInquiry')}</Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('common.na')}
                    </Text>
                </View>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.customerService')}</Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {translateLocal('termsStep.shortTermsForm.automatedOrLive')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.inactivity')}</Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {translateLocal('termsStep.shortTermsForm.afterTwelveMonths')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
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
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.electronicFundsInstantFee')}
                    </Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
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
