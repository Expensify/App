import React from 'react';
import {View, Linking} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CollapsibleSection from '../../../components/CollapsibleSection';
import {translateLocal} from '../../../libs/translate';
import CONST from '../../../CONST';
import Icon from '../../../components/Icon';
import {Printer} from '../../../components/Icon/Expensicons';

const LongTermsForm = () => (
    <>
        <CollapsibleSection title={translateLocal('termsStep.longTermsForm.listOfAllFees')}>
            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.longTermsForm.openingAccountTitle')}</Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
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
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
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
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
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
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
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
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
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
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.sendingFundsDetails')}
            </Text>

            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.electronicFundsWithdrawal')}</Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {translateLocal('termsStep.standard')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
                        {translateLocal('termsStep.feeAmountZero')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.formHint, styles.mt2]}>
                {translateLocal('termsStep.longTermsForm.electronicFundsStandardDetails')}
            </Text>

            <View style={[styles.longTermsRow]}>
                <View style={[styles.flex4]}>
                    <Text>{translateLocal('termsStep.electronicFundsWithdrawal')}</Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1]}>
                        {translateLocal('termsStep.instant')}
                    </Text>
                </View>
                <View style={[styles.flex1, styles.termsCenterRight]}>
                    <Text style={[styles.textStrong, styles.textAlignRight]}>
                        {translateLocal('termsStep.electronicFundsInstantFee')}
                    </Text>
                    <Text style={[styles.textMicroSupporting, styles.mt1, styles.textAlignRight]}>
                        {translateLocal('termsStep.electronicFundsInstantFeeMin')}
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

        <View style={styles.flexRow}>
            <Icon style={styles.flex1} src={Printer} />
            <Text
                style={[styles.link, styles.ml1]}
                onPress={() => Linking.openURL(CONST.FEES_URL)}
            >
                {translateLocal('termsStep.longTermsForm.printerFriendlyView')}
            </Text>
        </View>
    </>
);

LongTermsForm.displayName = 'LongTermsForm';
export default LongTermsForm;
