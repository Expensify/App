import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import ExpensifyText from '../../../components/ExpensifyText';
import * as Localize from '../../../libs/Localize';
import CONST from '../../../CONST';
import * as Link from '../../../libs/actions/Link';

const ShortTermsForm = () => (
    <>
        <ExpensifyText style={styles.mb5}>
            {Localize.translateLocal('termsStep.shortTermsForm.expensifyPaymentsAccount')}
        </ExpensifyText>

        <View style={[styles.shortTermsBorder, styles.p2, styles.mb6]}>
            <View style={[styles.shortTermsRow, styles.mb4]}>
                <View style={[styles.flex2]}>
                    <View style={[styles.flexRow, styles.mb1]}>
                        <ExpensifyText style={styles.textLarge}>{Localize.translateLocal('termsStep.monthlyFee')}</ExpensifyText>
                    </View>
                    <View style={styles.flexRow}>
                        <ExpensifyText style={styles.textXXXLarge}>{Localize.translateLocal('termsStep.feeAmountZero')}</ExpensifyText>
                    </View>
                </View>
                <View style={[styles.flex2]}>
                    <View style={[styles.flex2]}>
                        <View style={[styles.flexRow, styles.mb1]}>
                            <ExpensifyText style={styles.textLarge}>{Localize.translateLocal('termsStep.shortTermsForm.perPurchase')}</ExpensifyText>
                        </View>
                        <View style={styles.flexRow}>
                            <ExpensifyText style={styles.textXXXLarge}>{Localize.translateLocal('termsStep.feeAmountZero')}</ExpensifyText>
                        </View>
                    </View>
                </View>
            </View>

            <View style={[styles.shortTermsRow, styles.mb6]}>
                <View style={[styles.flex2]}>
                    <View style={[styles.flexRow, styles.mb1]}>
                        <ExpensifyText style={styles.textLarge}>{Localize.translateLocal('termsStep.shortTermsForm.atmWithdrawal')}</ExpensifyText>
                    </View>
                    <View style={styles.flexRow}>
                        <ExpensifyText style={styles.textXXXLarge}>{Localize.translateLocal('common.na')}</ExpensifyText>
                    </View>
                    <View style={styles.flexRow}>
                        <ExpensifyText style={styles.textLabelSupporting}>
                            {Localize.translateLocal('termsStep.shortTermsForm.inNetwork')}
                        </ExpensifyText>
                    </View>
                    <View style={[styles.flexRow, styles.mt1]}>
                        <ExpensifyText style={styles.textXXXLarge}>{Localize.translateLocal('common.na')}</ExpensifyText>
                    </View>
                    <View style={styles.flexRow}>
                        <ExpensifyText style={styles.textLabelSupporting}>
                            {Localize.translateLocal('termsStep.shortTermsForm.outOfNetwork')}
                        </ExpensifyText>
                    </View>
                </View>
                <View style={[styles.flex2]}>
                    <View style={[styles.flex2]}>
                        <View style={[styles.flexRow, styles.mb1]}>
                            <ExpensifyText style={styles.textLarge}>{Localize.translateLocal('termsStep.shortTermsForm.cashReload')}</ExpensifyText>
                        </View>
                        <View style={styles.flexRow}>
                            <ExpensifyText style={styles.textXXXLarge}>{Localize.translateLocal('common.na')}</ExpensifyText>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.shortTermsHorizontalRule} />
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex3, styles.pr4]}>
                    <ExpensifyText>
                        {Localize.translateLocal('termsStep.shortTermsForm.atmBalanceInquiry')}
                        {' '}
                        {Localize.translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork')}
                    </ExpensifyText>
                </View>
                <View style={styles.flex1}>
                    <ExpensifyText>
                        {Localize.translateLocal('common.na')}
                    </ExpensifyText>
                </View>
            </View>

            <View style={styles.shortTermsHorizontalRule} />
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex3, styles.pr4]}>
                    <ExpensifyText>
                        {Localize.translateLocal('termsStep.shortTermsForm.customerService')}
                        {' '}
                        {Localize.translateLocal('termsStep.shortTermsForm.automatedOrLive')}
                    </ExpensifyText>
                </View>
                <View style={styles.flex1}>
                    <ExpensifyText style={styles.label}>
                        {Localize.translateLocal('termsStep.feeAmountZero')}
                    </ExpensifyText>
                </View>
            </View>

            <View style={styles.shortTermsHorizontalRule} />
            <View style={[styles.shortTermsRow, styles.mb4]}>
                <View style={[styles.flex3, styles.pr4]}>
                    <ExpensifyText>
                        {Localize.translateLocal('termsStep.inactivity')}
                        {' '}
                        {Localize.translateLocal('termsStep.shortTermsForm.afterTwelveMonths')}
                    </ExpensifyText>
                </View>
                <View style={styles.flex1}>
                    <ExpensifyText>
                        {Localize.translateLocal('termsStep.feeAmountZero')}
                    </ExpensifyText>
                </View>
            </View>

            <View style={styles.shortTermsLargeHorizontalRule} />
            <View style={[styles.shortTermsBoldHeadingSection, styles.mb3]}>
                <ExpensifyText style={styles.textStrong}>
                    {Localize.translateLocal('termsStep.shortTermsForm.weChargeOneFee')}
                </ExpensifyText>
            </View>

            <View style={styles.shortTermsHorizontalRule} />
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex3, styles.pr4]}>
                    <ExpensifyText>
                        {Localize.translateLocal('termsStep.electronicFundsWithdrawal')}
                        {' '}
                        {Localize.translateLocal('termsStep.shortTermsForm.instant')}
                    </ExpensifyText>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <ExpensifyText style={styles.label}>
                        {Localize.translateLocal('termsStep.electronicFundsInstantFee')}
                        {' '}
                    </ExpensifyText>
                    <ExpensifyText style={styles.label}>
                        {Localize.translateLocal('termsStep.shortTermsForm.electronicFundsInstantFeeMin')}
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
