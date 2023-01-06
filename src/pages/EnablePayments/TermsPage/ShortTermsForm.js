import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import * as Localize from '../../../libs/Localize';
import CONST from '../../../CONST';
import * as Link from '../../../libs/actions/Link';

const ShortTermsForm = () => (
    <>
        <Text style={styles.mb5}>
            {Localize.translateLocal('termsStep.shortTermsForm.expensifyPaymentsAccount')}
        </Text>

        <View style={[styles.shortTermsBorder, styles.p2, styles.mb6]}>
            <View style={[styles.shortTermsRow, styles.mb4]}>
                <View style={[styles.flex2]}>
                    <View style={[styles.flexRow, styles.mb1]}>
                        <Text style={styles.textLarge}>{Localize.translateLocal('termsStep.monthlyFee')}</Text>
                    </View>
                    <View style={styles.flexRow}>
                        <Text style={[styles.textHeadline, styles.textXXXLarge]}>{Localize.translateLocal('termsStep.feeAmountZero')}</Text>
                    </View>
                </View>
                <View style={[styles.flex2]}>
                    <View style={[styles.flex2]}>
                        <View style={[styles.flexRow, styles.mb1]}>
                            <Text style={styles.textLarge}>{Localize.translateLocal('termsStep.shortTermsForm.perPurchase')}</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Text style={[styles.textHeadline, styles.textXXXLarge]}>{Localize.translateLocal('termsStep.feeAmountZero')}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={[styles.shortTermsRow, styles.mb6]}>
                <View style={[styles.flex2]}>
                    <View style={[styles.flexRow, styles.mb1]}>
                        <Text style={styles.textLarge}>{Localize.translateLocal('termsStep.shortTermsForm.atmWithdrawal')}</Text>
                    </View>
                    <View style={styles.flexRow}>
                        <Text style={[styles.textHeadline, styles.textXXXLarge]}>{Localize.translateLocal('common.na')}</Text>
                    </View>
                    <View style={styles.flexRow}>
                        <Text style={styles.textLabelSupporting}>
                            {Localize.translateLocal('termsStep.shortTermsForm.inNetwork')}
                        </Text>
                    </View>
                    <View style={[styles.flexRow, styles.mt1]}>
                        <Text style={[styles.textHeadline, styles.textXXXLarge]}>{Localize.translateLocal('common.na')}</Text>
                    </View>
                    <View style={styles.flexRow}>
                        <Text style={styles.textLabelSupporting}>
                            {Localize.translateLocal('termsStep.shortTermsForm.outOfNetwork')}
                        </Text>
                    </View>
                </View>
                <View style={[styles.flex2]}>
                    <View style={[styles.flex2]}>
                        <View style={[styles.flexRow, styles.mb1]}>
                            <Text style={styles.textLarge}>{Localize.translateLocal('termsStep.shortTermsForm.cashReload')}</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Text style={[styles.textHeadline, styles.textXXXLarge]}>{Localize.translateLocal('common.na')}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.shortTermsHorizontalRule} />
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex3, styles.pr4]}>
                    <Text>
                        {Localize.translateLocal('termsStep.shortTermsForm.atmBalanceInquiry')}
                        {' '}
                        {Localize.translateLocal('termsStep.shortTermsForm.inOrOutOfNetwork')}
                    </Text>
                </View>
                <View style={styles.flex1}>
                    <Text>
                        {Localize.translateLocal('common.na')}
                    </Text>
                </View>
            </View>

            <View style={styles.shortTermsHorizontalRule} />
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex3, styles.pr4]}>
                    <Text>
                        {Localize.translateLocal('termsStep.shortTermsForm.customerService')}
                        {' '}
                        {Localize.translateLocal('termsStep.shortTermsForm.automatedOrLive')}
                    </Text>
                </View>
                <View style={styles.flex1}>
                    <Text style={styles.label}>
                        {Localize.translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>

            <View style={styles.shortTermsHorizontalRule} />
            <View style={[styles.shortTermsRow, styles.mb4]}>
                <View style={[styles.flex3, styles.pr4]}>
                    <Text>
                        {Localize.translateLocal('termsStep.inactivity')}
                        {' '}
                        {Localize.translateLocal('termsStep.shortTermsForm.afterTwelveMonths')}
                    </Text>
                </View>
                <View style={styles.flex1}>
                    <Text>
                        {Localize.translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>

            <View style={styles.shortTermsLargeHorizontalRule} />
            <View style={[styles.shortTermsBoldHeadingSection, styles.mb3]}>
                <Text style={styles.textStrong}>
                    {Localize.translateLocal('termsStep.shortTermsForm.weChargeOneFee')}
                </Text>
            </View>

            <View style={styles.shortTermsHorizontalRule} />
            <View style={styles.shortTermsRow}>
                <View style={[styles.flex3, styles.pr4]}>
                    <Text>
                        {Localize.translateLocal('termsStep.electronicFundsWithdrawal')}
                        {' '}
                        {Localize.translateLocal('termsStep.shortTermsForm.instant')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={styles.label}>
                        {Localize.translateLocal('termsStep.electronicFundsInstantFee')}
                        {' '}
                    </Text>
                    <Text style={styles.label}>
                        {Localize.translateLocal('termsStep.shortTermsForm.electronicFundsInstantFeeMin')}
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
