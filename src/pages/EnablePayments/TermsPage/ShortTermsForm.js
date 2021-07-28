import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import {translateLocal} from '../../../libs/translate';

const ShortTermsForm = () => (
    <>
        <View style={styles.mb5}>
            <Text style={styles.mb5}>
                {translateLocal('termsStep.shortTermsForm.expensifyPaymentsAccount')}
            </Text>
            <View style={[styles.border, styles.pl4, styles.pr4]}>
                <View style={[styles.flexRow, styles.pt4, styles.pb4]}>
                    <View style={[styles.flex4]}>
                        <Text>{translateLocal('termsStep.shortTermsForm.atmBalanceInquiry')}</Text>
                        <Text style={[styles.textMicro]}>
                            {translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork')}
                        </Text>
                    </View>
                    <View style={[styles.flex1, styles.termsCenterRight]}>
                        <Text style={styles.textStrong}>
                            {translateLocal('common.na')}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.flex1, styles.flexRow, styles.mb3]}>
                <View style={styles.flex1}>
                    <Text>{translateLocal('termsStep.monthlyFee')}</Text>
                </View>
                <View style={styles.flex1}>
                    <Text>{translateLocal('termsStep.shortTermsForm.perPurchase')}</Text>
                </View>
                <View style={styles.flex1}>
                    <Text>{translateLocal('termsStep.shortTermsForm.atmWithdrawal')}</Text>
                </View>
                <View style={styles.flex1}>
                    <Text>{translateLocal('termsStep.shortTermsForm.cashReload')}</Text>
                </View>
            </View>
            <View style={[styles.flex1, styles.flexRow]}>
                <View style={styles.flex1}>
                    <Text>{translateLocal('termsStep.feeAmountZero')}</Text>
                </View>
                <View style={styles.flex1}>
                    <Text>{translateLocal('termsStep.feeAmountZero')}</Text>
                </View>
                <View style={styles.flex1}>
                    <View style={styles.flex1}>
                        <Text>{translateLocal('common.na')}</Text>
                        <Text style={styles.textMicro}>
                            {translateLocal('termsStep.shortTermsForm.inNetwork')}
                        </Text>
                    </View>
                    <View style={styles.flex1}>
                        <Text>{translateLocal('common.na')}</Text>
                        <Text style={styles.textMicro}>
                            {translateLocal('termsStep.shortTermsForm.outOfNetwork')}
                        </Text>
                    </View>
                </View>
                <View style={styles.flex1}>
                    <Text>{translateLocal('common.na')}</Text>
                </View>
            </View>
        </View>

        <View style={[styles.termsRow, styles.flexRow]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text>{translateLocal('termsStep.shortTermsForm.atmBalanceInquiry')}</Text>
                <Text style={[styles.textMicro]}>
                    {translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork')}
                </Text>
            </View>
            <View style={[styles.flex1, styles.p2]}>
                <Text>{translateLocal('common.na')}</Text>
            </View>
        </View>
        <View style={[styles.termsRow, styles.flexRow]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text>{translateLocal('termsStep.shortTermsForm.customerService')}</Text>
                <Text style={[styles.textMicro]}>
                    {translateLocal('termsStep.shortTermsForm.automatedOrLive')}
                </Text>
            </View>
            <View style={[styles.flex1, styles.p2]}>
                <Text>{translateLocal('termsStep.feeAmountZero')}</Text>
            </View>
        </View>
        <View style={[styles.termsRow, styles.flexRow, styles.mb2]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text>{translateLocal('termsStep.inactivity')}</Text>
                <Text style={[styles.textMicro]}>
                    {translateLocal('termsStep.shortTermsForm.afterTwelveMonths')}
                </Text>
            </View>
            <View style={[styles.flex1, styles.p2]}>
                <Text>{translateLocal('termsStep.feeAmountZero')}</Text>
            </View>
        </View>
        <View style={[styles.termsRowBold, styles.flexRow]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text style={styles.h3}>
                    {translateLocal('termsStep.shortTermsForm.weChargeOneFee')}
                </Text>
            </View>
        </View>
        <View style={[styles.termsRow, styles.flexRow]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text>{translateLocal('termsStep.shortTermsForm.electronicFundsWithdrawal')}</Text>
                <Text style={styles.textMicro}>{translateLocal('termsStep.shortTermsForm.instant')}</Text>
            </View>
            <View style={[styles.flex1, styles.p2]}>
                <Text>{translateLocal('termsStep.electronicFundsInstantFee')}</Text>
            </View>
        </View>

        <View style={[styles.termsRow, styles.pt4]}>
            <Text style={styles.textStrong}>
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
    </>
);

ShortTermsForm.displayName = 'ShortTermsForm';

export default ShortTermsForm;
