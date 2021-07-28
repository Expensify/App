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
        feeAmount: translateLocal('termsStep.feeAmountZero'),
        moreDetails: translateLocal('termsStep.longTermsForm.customerServiceDetails'),
    },
    {
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
            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.longTermsForm.openingAccountTitle')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.openingAccountDetails')}
            </Text>

            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.monthlyFee')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.monthlyFeeDetails')}
            </Text>

            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>
                        {translateLocal('termsStep.longTermsForm.customerServiceTitle')}
                    </Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {translateLocal('termsStep.longTermsForm.automated')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.customerServiceDetails')}
            </Text>

            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>
                        {translateLocal('termsStep.longTermsForm.customerServiceTitle')}
                    </Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {translateLocal('termsStep.longTermsForm.liveAgent')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.customerServiceDetails')}
            </Text>

            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.inactivity')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.inactivityDetails')}
            </Text>

            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.longTermsForm.sendingFundsTitle')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.sendingFundsDetails')}
            </Text>

            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.longTermsForm.electronicFundsStandardTitle')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.electronicFundsStandardDetails')}
            </Text>

            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.longTermsForm.electronicFundsInstantTitle')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.textStrong}>
                        {translateLocal('termsStep.electronicFundsInstantFee')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.electronicFundsInstantDetails')}
            </Text>

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
