import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CollapsibleSection from '../../../components/CollapsibleSection';
import * as Localize from '../../../libs/Localize/Localize';
import CONST from '../../../CONST';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Link from '../../../libs/actions/Link';

const termsData = [
    {
        title: Localize.translateLocal('termsStep.longTermsForm.openingAccountTitle'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
        details: Localize.translateLocal('termsStep.longTermsForm.openingAccountDetails'),
    },
    {
        title: Localize.translateLocal('termsStep.monthlyFee'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
        details: Localize.translateLocal('termsStep.longTermsForm.monthlyFeeDetails'),
    },
    {
        title: Localize.translateLocal('termsStep.longTermsForm.customerServiceTitle'),
        subTitle: Localize.translateLocal('termsStep.longTermsForm.automated'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
        details: Localize.translateLocal('termsStep.longTermsForm.customerServiceDetails'),
    },
    {
        title: Localize.translateLocal('termsStep.longTermsForm.customerServiceTitle'),
        subTitle: Localize.translateLocal('termsStep.longTermsForm.liveAgent'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
        details: Localize.translateLocal('termsStep.longTermsForm.customerServiceDetails'),
    },
    {
        title: Localize.translateLocal('termsStep.inactivity'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
        details: Localize.translateLocal('termsStep.longTermsForm.inactivityDetails'),
    },
    {
        title: Localize.translateLocal('termsStep.longTermsForm.sendingFundsTitle'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
        details: Localize.translateLocal('termsStep.longTermsForm.sendingFundsDetails'),
    },
    {
        title: Localize.translateLocal('termsStep.electronicFundsWithdrawal'),
        subTitle: Localize.translateLocal('termsStep.standard'),
        rightText: Localize.translateLocal('termsStep.feeAmountZero'),
        details: Localize.translateLocal('termsStep.longTermsForm.electronicFundsStandardDetails'),
    },
    {
        title: Localize.translateLocal('termsStep.electronicFundsWithdrawal'),
        subTitle: Localize.translateLocal('termsStep.longTermsForm.instant'),
        rightText: Localize.translateLocal('termsStep.electronicFundsInstantFee'),
        subRightText: Localize.translateLocal('termsStep.longTermsForm.electronicFundsInstantFeeMin'),
        details: Localize.translateLocal('termsStep.longTermsForm.electronicFundsInstantDetails'),
    },
];

const getLongTermsSections = () => _.map(termsData, (section, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <View key={section.title + index}>
        <View style={[styles.longTermsRow]}>
            <View style={[styles.flex4]}>
                <Text>{section.title}</Text>
                {
                    section.subTitle
                    && (
                        <Text style={[styles.textMicroSupporting, styles.mt1]}>
                            {section.subTitle}
                        </Text>
                    )
                }
            </View>
            <View style={[styles.flex1, styles.termsCenterRight]}>
                <Text style={[styles.textStrong, styles.textAlignRight]}>
                    {section.rightText}
                </Text>
                {
                    section.subRightText
                    && (
                        <Text style={[styles.textMicroSupporting, styles.mt1, styles.textAlignRight]}>
                            {section.subRightText}
                        </Text>
                    )
                }
            </View>
        </View>
        <Text style={[styles.textLabelSupporting, styles.mt2]}>
            {section.details}
        </Text>
    </View>
));

const LongTermsForm = () => (
    <>
        <CollapsibleSection title={Localize.translateLocal('termsStep.longTermsForm.listOfAllFees')}>
            {getLongTermsSections()}
        </CollapsibleSection>

        <Text style={[styles.mb4, styles.mt6, styles.textMicroSupporting]}>
            {Localize.translateLocal('termsStep.longTermsForm.fdicInsuranceBancorp')}
            {' '}
            {CONST.TERMS.FDIC_PREPAID}
            {' '}
            {Localize.translateLocal('termsStep.longTermsForm.fdicInsuranceBancorp2')}
        </Text>
        <Text style={[styles.mb4, styles.textMicroSupporting]}>
            {Localize.translateLocal('termsStep.noOverdraftOrCredit')}
        </Text>
        <Text style={[styles.mb4, styles.textMicroSupporting]}>
            {Localize.translateLocal('termsStep.longTermsForm.contactExpensifyPayments')}
            {' '}
            {CONST.EMAIL.CONCIERGE}
            {' '}
            {Localize.translateLocal('termsStep.longTermsForm.contactExpensifyPayments2')}
            {' '}
            {CONST.NEW_EXPENSIFY_URL}
            .
        </Text>
        <Text style={[styles.mb6, styles.textMicroSupporting]}>
            {Localize.translateLocal('termsStep.longTermsForm.generalInformation')}
            {' '}
            {CONST.TERMS.CFPB_PREPAID}
            {'. '}
            {Localize.translateLocal('termsStep.longTermsForm.generalInformation2')}
            {' '}
            {CONST.TERMS.CFPB_COMPLAINT}
            .
        </Text>

        <View style={styles.flexRow}>
            <Icon style={styles.flex1} src={Expensicons.Printer} />
            <Text
                style={[styles.link, styles.ml1]}
                onPress={() => Link.openExternalLink(CONST.FEES_URL)}
            >
                {Localize.translateLocal('termsStep.longTermsForm.printerFriendlyView')}
            </Text>
        </View>
    </>
);

LongTermsForm.displayName = 'LongTermsForm';
export default LongTermsForm;
