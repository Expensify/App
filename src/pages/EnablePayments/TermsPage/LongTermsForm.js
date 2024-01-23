import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import CollapsibleSection from '@components/CollapsibleSection';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from "@hooks/useLocalize";
import CONST from '@src/CONST';

function LongTermsForm() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const termsData = [
        {
            title: translate('termsStep.longTermsForm.openingAccountTitle'),
            rightText: translate('termsStep.feeAmountZero'),
            details: translate('termsStep.longTermsForm.openingAccountDetails'),
        },
        {
            title: translate('termsStep.monthlyFee'),
            rightText: translate('termsStep.feeAmountZero'),
            details: translate('termsStep.longTermsForm.monthlyFeeDetails'),
        },
        {
            title: translate('termsStep.longTermsForm.customerServiceTitle'),
            subTitle: translate('termsStep.longTermsForm.automated'),
            rightText: translate('termsStep.feeAmountZero'),
            details: translate('termsStep.longTermsForm.customerServiceDetails'),
        },
        {
            title: translate('termsStep.longTermsForm.customerServiceTitle'),
            subTitle: translate('termsStep.longTermsForm.liveAgent'),
            rightText: translate('termsStep.feeAmountZero'),
            details: translate('termsStep.longTermsForm.customerServiceDetails'),
        },
        {
            title: translate('termsStep.inactivity'),
            rightText: translate('termsStep.feeAmountZero'),
            details: translate('termsStep.longTermsForm.inactivityDetails'),
        },
        {
            title: translate('termsStep.longTermsForm.sendingFundsTitle'),
            rightText: translate('termsStep.feeAmountZero'),
            details: translate('termsStep.longTermsForm.sendingFundsDetails'),
        },
        {
            title: translate('termsStep.electronicFundsWithdrawal'),
            subTitle: translate('termsStep.standard'),
            rightText: translate('termsStep.feeAmountZero'),
            details: translate('termsStep.longTermsForm.electronicFundsStandardDetails'),
        },
        {
            title: translate('termsStep.electronicFundsWithdrawal'),
            subTitle: translate('termsStep.longTermsForm.instant'),
            rightText: translate('termsStep.electronicFundsInstantFee'),
            subRightText: translate('termsStep.longTermsForm.electronicFundsInstantFeeMin'),
            details: translate('termsStep.longTermsForm.electronicFundsInstantDetails'),
        },
    ];

    const getLongTermsSections = () =>
        _.map(termsData, (section, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <View key={section.title + index}>
                <View style={[styles.longTermsRow]}>
                    <View style={[styles.flex4]}>
                        <Text>{section.title}</Text>
                        {Boolean(section.subTitle) && <Text style={[styles.textMicroSupporting, styles.mt1]}>{section.subTitle}</Text>}
                    </View>
                    <View style={[styles.flex1, styles.termsCenterRight]}>
                        <Text style={[styles.textStrong, styles.textAlignRight]}>{section.rightText}</Text>
                        {Boolean(section.subRightText) && <Text style={[styles.textMicroSupporting, styles.mt1, styles.textAlignRight]}>{section.subRightText}</Text>}
                    </View>
                </View>
                <Text style={[styles.textLabelSupporting, styles.mt2]}>{section.details}</Text>
            </View>
        ));

    return (
        <>
            <CollapsibleSection title={translate('termsStep.longTermsForm.listOfAllFees')}>{getLongTermsSections()}</CollapsibleSection>

            <Text style={[styles.mb4, styles.mt6, styles.textMicroSupporting]}>
                {translate('termsStep.longTermsForm.fdicInsuranceBancorp')} {CONST.TERMS.FDIC_PREPAID}{' '}
                {translate('termsStep.longTermsForm.fdicInsuranceBancorp2')}
            </Text>
            <Text style={[styles.mb4, styles.textMicroSupporting]}>{translate('termsStep.noOverdraftOrCredit')}</Text>
            <Text style={[styles.mb4, styles.textMicroSupporting]}>
                {translate('termsStep.longTermsForm.contactExpensifyPayments')} {CONST.EMAIL.CONCIERGE}{' '}
                {translate('termsStep.longTermsForm.contactExpensifyPayments2')} {CONST.NEW_EXPENSIFY_URL}.
            </Text>
            <Text style={[styles.mb6, styles.textMicroSupporting]}>
                {translate('termsStep.longTermsForm.generalInformation')} {CONST.TERMS.CFPB_PREPAID}
                {'. '}
                {translate('termsStep.longTermsForm.generalInformation2')} {CONST.TERMS.CFPB_COMPLAINT}.
            </Text>

            <View style={styles.flexRow}>
                <Icon
                    fill={theme.icon}
                    style={styles.flex1}
                    src={Expensicons.Printer}
                />
                <TextLink
                    style={styles.ml1}
                    href={CONST.FEES_URL}
                >
                    {translate('termsStep.longTermsForm.printerFriendlyView')}
                </TextLink>
            </View>
        </>
    );
}

LongTermsForm.displayName = 'LongTermsForm';
export default LongTermsForm;
