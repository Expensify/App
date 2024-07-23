import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import type {UserWallet} from '@src/types/onyx';

type ShortTermsFormProps = {
    /** The user's wallet */
    userWallet: OnyxEntry<UserWallet>;
};

function ShortTermsForm(props: ShortTermsFormProps) {
    const styles = useThemeStyles();
    const {translate, numberFormat} = useLocalize();
    return (
        <>
            <Text style={[styles.mb5, styles.textSupporting]}>
                {translate('termsStep.shortTermsForm.expensifyPaymentsAccount', {
                    walletProgram:
                        props.userWallet && props.userWallet?.walletProgramID === CONST.WALLET.BANCORP_WALLET_PROGRAM_ID
                            ? CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK
                            : CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS,
                })}
            </Text>

            <View style={[styles.shortTermsBorder, styles.p2, styles.mb6]}>
                <View style={[styles.shortTermsRow, styles.mb4]}>
                    <View style={[styles.flex2]}>
                        <View style={[styles.flexRow, styles.mb1]}>
                            <Text style={styles.mutedNormalTextLabel}>{translate('termsStep.monthlyFee')}</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Text style={styles.shortTermsHeadline}>{CurrencyUtils.convertToDisplayString(0, 'USD')}</Text>
                        </View>
                    </View>
                    <View style={[styles.flex2]}>
                        <View style={[styles.flex2]}>
                            <View style={[styles.flexRow, styles.mb1]}>
                                <Text style={styles.mutedNormalTextLabel}>{translate('termsStep.shortTermsForm.perPurchase')}</Text>
                            </View>
                            <View style={styles.flexRow}>
                                <Text style={styles.shortTermsHeadline}>{CurrencyUtils.convertToDisplayString(0, 'USD')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.shortTermsRow, styles.mb6]}>
                    <View style={styles.flex2}>
                        <View style={[styles.flexRow, styles.mb1]}>
                            <Text style={styles.mutedNormalTextLabel}>{translate('termsStep.shortTermsForm.atmWithdrawal')}</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Text style={styles.shortTermsHeadline}>{translate('common.na')}</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Text style={styles.textMicroSupporting}>{translate('termsStep.shortTermsForm.inNetwork')}</Text>
                        </View>
                        <View style={[styles.flexRow, styles.mt4]}>
                            <Text style={styles.shortTermsHeadline}>{translate('common.na')}</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Text style={styles.textMicroSupporting}>{translate('termsStep.shortTermsForm.outOfNetwork')}</Text>
                        </View>
                    </View>
                    <View style={[styles.flex2]}>
                        <View style={[styles.flex2]}>
                            <View style={[styles.flexRow, styles.mb1]}>
                                <Text style={styles.mutedNormalTextLabel}>{translate('termsStep.shortTermsForm.cashReload')}</Text>
                            </View>
                            <View style={styles.flexRow}>
                                <Text style={styles.shortTermsHeadline}>{translate('common.na')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.shortTermsHorizontalRule} />
                <View style={styles.shortTermsRow}>
                    <View style={[styles.flex3, styles.pr4]}>
                        <Text>
                            {translate('termsStep.shortTermsForm.atmBalanceInquiry')} {translate('termsStep.shortTermsForm.inOrOutOfNetwork')}
                        </Text>
                    </View>
                    <View style={styles.flex1}>
                        <Text>{translate('common.na')}</Text>
                    </View>
                </View>

                <View style={styles.shortTermsHorizontalRule} />
                <View style={styles.shortTermsRow}>
                    <View style={[styles.flex3, styles.pr4]}>
                        <Text>
                            {translate('termsStep.shortTermsForm.customerService')} {translate('termsStep.shortTermsForm.automatedOrLive')}
                        </Text>
                    </View>
                    <View style={styles.flex1}>
                        <Text style={styles.label}>{CurrencyUtils.convertToDisplayString(0, 'USD')}</Text>
                    </View>
                </View>

                <View style={styles.shortTermsHorizontalRule} />
                <View style={[styles.shortTermsRow, styles.mb4]}>
                    <View style={[styles.flex3, styles.pr4]}>
                        <Text>
                            {translate('termsStep.inactivity')} {translate('termsStep.shortTermsForm.afterTwelveMonths')}
                        </Text>
                    </View>
                    <View style={styles.flex1}>
                        <Text>{CurrencyUtils.convertToDisplayString(0, 'USD')}</Text>
                    </View>
                </View>

                <View style={styles.shortTermsLargeHorizontalRule} />
                <View style={[styles.shortTermsBoldHeadingSection, styles.mb3]}>
                    <Text style={styles.textStrong}>{translate('termsStep.shortTermsForm.weChargeOneFee')}</Text>
                </View>

                <View style={styles.shortTermsHorizontalRule} />
                <View style={styles.shortTermsRow}>
                    <View style={[styles.flex3, styles.pr4]}>
                        <Text>
                            {translate('termsStep.electronicFundsWithdrawal')} {translate('termsStep.shortTermsForm.instant')}
                        </Text>
                    </View>
                    <View style={[styles.flex1, styles.termsCenterRight]}>
                        <Text style={styles.label}>{numberFormat(1.5)}%</Text>
                        <Text style={styles.label}>{translate('termsStep.shortTermsForm.electronicFundsInstantFeeMin', {amount: CurrencyUtils.convertToDisplayString(25, 'USD')})}</Text>
                    </View>
                </View>
                <View style={[styles.shortTermsBoldHeadingSection, styles.mb4]}>
                    <Text style={[styles.textStrong, styles.mb3]}>{translate('termsStep.noOverdraftOrCredit')}</Text>
                    <Text style={styles.mb3}>{translate('termsStep.shortTermsForm.fdicInsurance')}</Text>
                    <Text style={styles.mb3}>
                        {translate('termsStep.shortTermsForm.generalInfo')} <TextLink href={CONST.CFPB_PREPAID_URL}>{CONST.TERMS.CFPB_PREPAID}</TextLink>.
                    </Text>
                    <Text>
                        {translate('termsStep.shortTermsForm.conditionsDetails')} <TextLink href={CONST.FEES_URL}>{CONST.TERMS.USE_EXPENSIFY_FEES}</TextLink>{' '}
                        {translate('termsStep.shortTermsForm.conditionsPhone')}
                    </Text>
                </View>
            </View>
        </>
    );
}

ShortTermsForm.displayName = 'ShortTermsForm';

export default ShortTermsForm;
