"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var CONST_1 = require("@src/CONST");
function ShortTermsForm(props) {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, numberFormat = _b.numberFormat;
    return (<>
            <Text_1.default style={[styles.mb5, styles.textSupporting]}>
                {translate('termsStep.shortTermsForm.expensifyPaymentsAccount', {
            walletProgram: props.userWallet && ((_a = props.userWallet) === null || _a === void 0 ? void 0 : _a.walletProgramID) === CONST_1.default.WALLET.BANCORP_WALLET_PROGRAM_ID
                ? CONST_1.default.WALLET.PROGRAM_ISSUERS.BANCORP_BANK
                : CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS,
        })}
            </Text_1.default>

            <react_native_1.View style={[styles.shortTermsBorder, styles.p2, styles.mb6]}>
                <react_native_1.View style={[styles.shortTermsRow, styles.mb4]}>
                    <react_native_1.View style={[styles.flex2]}>
                        <react_native_1.View style={[styles.flexRow, styles.mb1]}>
                            <Text_1.default style={styles.mutedNormalTextLabel}>{translate('termsStep.monthlyFee')}</Text_1.default>
                        </react_native_1.View>
                        <react_native_1.View style={styles.flexRow}>
                            <Text_1.default style={styles.shortTermsHeadline}>{(0, CurrencyUtils_1.convertToDisplayString)(0, 'USD')}</Text_1.default>
                        </react_native_1.View>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.flex2]}>
                        <react_native_1.View style={[styles.flex2]}>
                            <react_native_1.View style={[styles.flexRow, styles.mb1]}>
                                <Text_1.default style={styles.mutedNormalTextLabel}>{translate('termsStep.shortTermsForm.perPurchase')}</Text_1.default>
                            </react_native_1.View>
                            <react_native_1.View style={styles.flexRow}>
                                <Text_1.default style={styles.shortTermsHeadline}>{(0, CurrencyUtils_1.convertToDisplayString)(0, 'USD')}</Text_1.default>
                            </react_native_1.View>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>

                <react_native_1.View style={[styles.shortTermsRow, styles.mb6]}>
                    <react_native_1.View style={styles.flex2}>
                        <react_native_1.View style={[styles.flexRow, styles.mb1]}>
                            <Text_1.default style={styles.mutedNormalTextLabel}>{translate('termsStep.shortTermsForm.atmWithdrawal')}</Text_1.default>
                        </react_native_1.View>
                        <react_native_1.View style={styles.flexRow}>
                            <Text_1.default style={styles.shortTermsHeadline}>{translate('common.na')}</Text_1.default>
                        </react_native_1.View>
                        <react_native_1.View style={styles.flexRow}>
                            <Text_1.default style={styles.textMicroSupporting}>{translate('termsStep.shortTermsForm.inNetwork')}</Text_1.default>
                        </react_native_1.View>
                        <react_native_1.View style={[styles.flexRow, styles.mt4]}>
                            <Text_1.default style={styles.shortTermsHeadline}>{translate('common.na')}</Text_1.default>
                        </react_native_1.View>
                        <react_native_1.View style={styles.flexRow}>
                            <Text_1.default style={styles.textMicroSupporting}>{translate('termsStep.shortTermsForm.outOfNetwork')}</Text_1.default>
                        </react_native_1.View>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.flex2]}>
                        <react_native_1.View style={[styles.flex2]}>
                            <react_native_1.View style={[styles.flexRow, styles.mb1]}>
                                <Text_1.default style={styles.mutedNormalTextLabel}>{translate('termsStep.shortTermsForm.cashReload')}</Text_1.default>
                            </react_native_1.View>
                            <react_native_1.View style={styles.flexRow}>
                                <Text_1.default style={styles.shortTermsHeadline}>{translate('common.na')}</Text_1.default>
                            </react_native_1.View>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>

                <react_native_1.View style={styles.shortTermsHorizontalRule}/>
                <react_native_1.View style={styles.shortTermsRow}>
                    <react_native_1.View style={[styles.flex3, styles.pr4]}>
                        <Text_1.default>
                            {translate('termsStep.shortTermsForm.atmBalanceInquiry')} {translate('termsStep.shortTermsForm.inOrOutOfNetwork')}
                        </Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={styles.flex1}>
                        <Text_1.default>{translate('common.na')}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>

                <react_native_1.View style={styles.shortTermsHorizontalRule}/>
                <react_native_1.View style={styles.shortTermsRow}>
                    <react_native_1.View style={[styles.flex3, styles.pr4]}>
                        <Text_1.default>
                            {translate('termsStep.shortTermsForm.customerService')} {translate('termsStep.shortTermsForm.automatedOrLive')}
                        </Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={styles.flex1}>
                        <Text_1.default>{(0, CurrencyUtils_1.convertToDisplayString)(0, 'USD')}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>

                <react_native_1.View style={styles.shortTermsHorizontalRule}/>
                <react_native_1.View style={[styles.shortTermsRow, styles.mb4]}>
                    <react_native_1.View style={[styles.flex3, styles.pr4]}>
                        <Text_1.default>
                            {translate('termsStep.inactivity')} {translate('termsStep.shortTermsForm.afterTwelveMonths')}
                        </Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={styles.flex1}>
                        <Text_1.default>{(0, CurrencyUtils_1.convertToDisplayString)(0, 'USD')}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>

                <react_native_1.View style={styles.shortTermsLargeHorizontalRule}/>
                <react_native_1.View style={[styles.shortTermsBoldHeadingSection, styles.mb3]}>
                    <Text_1.default style={styles.textStrong}>{translate('termsStep.shortTermsForm.weChargeOneFee')}</Text_1.default>
                </react_native_1.View>

                <react_native_1.View style={styles.shortTermsHorizontalRule}/>
                <react_native_1.View style={styles.shortTermsRow}>
                    <react_native_1.View style={[styles.flex3, styles.pr4]}>
                        <Text_1.default>
                            {translate('termsStep.electronicFundsWithdrawal')} {translate('termsStep.shortTermsForm.instant')}
                        </Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.flex1, styles.termsCenterRight]}>
                        <Text_1.default style={styles.label}>{numberFormat(1.5)}%</Text_1.default>
                        <Text_1.default style={styles.label}>{translate('termsStep.shortTermsForm.electronicFundsInstantFeeMin', { amount: (0, CurrencyUtils_1.convertToDisplayString)(25, 'USD') })}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
                <react_native_1.View style={[styles.shortTermsBoldHeadingSection, styles.mb4]}>
                    <Text_1.default style={[styles.textStrong, styles.mb3]}>{translate('termsStep.noOverdraftOrCredit')}</Text_1.default>
                    <Text_1.default style={styles.mb3}>{translate('termsStep.shortTermsForm.fdicInsurance')}</Text_1.default>
                    <Text_1.default style={styles.mb3}>
                        {translate('termsStep.shortTermsForm.generalInfo')} <TextLink_1.default href={CONST_1.default.CFPB_PREPAID_URL}>{CONST_1.default.TERMS.CFPB_PREPAID}</TextLink_1.default>.
                    </Text_1.default>
                    <Text_1.default>
                        {translate('termsStep.shortTermsForm.conditionsDetails')} <TextLink_1.default href={CONST_1.default.FEES_URL}>{CONST_1.default.TERMS.USE_EXPENSIFY_FEES}</TextLink_1.default>{' '}
                        {translate('termsStep.shortTermsForm.conditionsPhone')}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </>);
}
ShortTermsForm.displayName = 'ShortTermsForm';
exports.default = ShortTermsForm;
