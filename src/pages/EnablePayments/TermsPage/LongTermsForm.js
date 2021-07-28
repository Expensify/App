import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CollapsibleSection from '../../../components/CollapsibleSection';
import {translateLocal} from '../../../libs/translate';
import TextLink from '../../../components/TextLink';
import CONST from '../../../CONST';

const termsData = [
    {
        sectionTitle: translateLocal('termsStep.longTermsForm.openingAccountTitle'),
        typeOfFee: translateLocal('termsStep.longTermsForm.openingAccountTitle'),
        feeAmount: translateLocal('termsStep.feeAmountZero'),
        moreDetails: translateLocal('termsStep.longTermsForm.openingAccountDetails'),
    },
    {
        sectionTitle: translateLocal('termsStep.monthlyFee'),
        typeOfFee: translateLocal('termsStep.monthlyFee'),
        feeAmount: translateLocal('termsStep.feeAmountZero'),
        moreDetails: translateLocal('termsStep.longTermsForm.monthlyFeeDetails'),
    },
    {
        sectionTitle: translateLocal('termsStep.longTermsForm.customerServiceAutomatedTitle'),
        typeOfFee: translateLocal('termsStep.longTermsForm.customerServiceAutomatedTitle'),
        feeAmount: translateLocal('termsStep.feeAmountZero'),
        moreDetails: translateLocal('termsStep.longTermsForm.customerServiceDetails'),
    },
    {
        sectionTitle: translateLocal('termsStep.longTermsForm.customerServiceLiveTitle'),
        typeOfFee: translateLocal('termsStep.longTermsForm.customerServiceLiveTitle'),
        feeAmount: translateLocal('termsStep.feeAmountZero'),
        moreDetails: translateLocal('termsStep.longTermsForm.customerServiceDetails'),
    },
    {
        sectionTitle: translateLocal('termsStep.inactivity'),
        typeOfFee: translateLocal('termsStep.inactivity'),
        feeAmount: translateLocal('termsStep.feeAmountZero'),
        moreDetails: translateLocal('termsStep.longTermsForm.inactivityDetails'),
    },
    {
        sectionTitle: translateLocal('termsStep.longTermsForm.sendingFundsTitle'),
        typeOfFee: translateLocal('termsStep.longTermsForm.sendingFundsTitle'),
        feeAmount: translateLocal('termsStep.feeAmountZero'),
        moreDetails: translateLocal('termsStep.longTermsForm.sendingFundsDetails'),
    },
    {
        sectionTitle: translateLocal('termsStep.longTermsForm.electronicFundsStandardTitle'),
        typeOfFee: translateLocal('termsStep.longTermsForm.electronicFundsStandardTitle'),
        feeAmount: translateLocal('termsStep.feeAmountZero'),
        moreDetails: translateLocal('termsStep.longTermsForm.electronicFundsStandardDetails'),
    },
    {
        sectionTitle: translateLocal('termsStep.longTermsForm.electronicFundsInstantTitle'),
        typeOfFee: translateLocal('termsStep.longTermsForm.electronicFundsInstantTitle'),
        feeAmount: translateLocal('termsStep.electronicFundsInstantFee'),
        moreDetails: translateLocal('termsStep.longTermsForm.electronicFundsInstantDetails'),
    },
];

const LongTermsForm = () => (
    <>
        <CollapsibleSection title={translateLocal('termsStep.longTermsForm.listOfAllFees')}>
            <View style={[styles.shortTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.monthlyFee')}</Text>
                </View>
                <View style={[styles.flex1, styles.shortTermsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <View style={[styles.shortTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.perPurchase')}</Text>
                </View>
                <View style={[styles.flex1, styles.shortTermsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.atmWithdrawal')}</Text>
                    <Text style={[styles.textMicroSupporting]}>
                        {translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.shortTermsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('common.na')}
                    </Text>
                </View>
            </View>
            <View style={[styles.shortTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.cashReload')}</Text>
                </View>
                <View style={[styles.flex1, styles.shortTermsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('common.na')}
                    </Text>
                </View>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.atmBalanceInquiry')}</Text>
                    <Text style={[styles.textMicroSupporting]}>
                        {translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.shortTermsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('common.na')}
                    </Text>
                </View>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.shortTermsForm.customerService')}</Text>
                    <Text style={[styles.textMicroSupporting]}>
                        {translateLocal('termsStep.shortTermsForm.automatedOrLive')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.shortTermsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.inactivity')}</Text>
                    <Text style={[styles.textMicroSupporting]}>
                        {translateLocal('termsStep.shortTermsForm.afterTwelveMonths')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.shortTermsCenterRight]}>
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
                    <Text>{translateLocal('termsStep.shortTermsForm.electronicFundsWithdrawal')}</Text>
                    <Text style={styles.textMicroSupporting}>
                        {translateLocal('termsStep.shortTermsForm.instant')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.shortTermsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.electronicFundsInstantFee')}
                    </Text>
                    <Text style={styles.textMicroSupporting}>
                        {translateLocal('termsStep.electronicFundsInstantFeeMin')}
                    </Text>
                </View>
            </View>
            <View style={styles.shortTermsBoldHeadingSection}>
                <Text style={[styles.textStrong, styles.mb3]}>
                    {translateLocal('termsStep.noOverdraftOrCredit')}
                </Text>
                <Text style={styles.mb3}>
                    {translateLocal('termsStep.shortTermsForm.fdicInsurance')}
                </Text>
                <Text style={styles.mb3}>
                    {translateLocal('termsStep.shortTermsForm.generalInfo')}
                    {' '}
                    <TextLink href="https://cfpb.gov/prepaid">
                        cfpb.gov/prepaid
                    </TextLink>
                    .
                </Text>
                <Text>
                    {translateLocal('termsStep.shortTermsForm.conditionsDetails')}
                    {' '}
                    <TextLink href="https://use.expensify.com/fees">
                        use.expensify.com/fees
                    </TextLink>
                    {' '}
                    {translateLocal('termsStep.shortTermsForm.conditionsPhone')}
                </Text>
            </View>
        </CollapsibleSection>

        <Text style={[styles.mb4, styles.mt6, styles.textMicroSupporting]}>
            {translateLocal('termsStep.longTermsForm.fdicInsuranceBancorp')}
            {' '}
            fdic.gov/deposit/deposits/prepaid.html
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
            new.expensify.com.
        </Text>
        <Text style={[styles.mb6, styles.textMicroSupporting]}>
            {translateLocal('termsStep.longTermsForm.generalInformation')}
            {' '}
            cfpb.gov/prepaid
            {' '}
            {translateLocal('termsStep.longTermsForm.generalInformation2')}
            {' '}
            cfpb.gov/complaint.
        </Text>

        <TextLink href="https://expensify-use2.squarespace.com/fees">
            {translateLocal('termsStep.longTermsForm.printerFriendlyView')}
        </TextLink>
    </>
);

LongTermsForm.displayName = 'LongTermsForm';
export default LongTermsForm;
