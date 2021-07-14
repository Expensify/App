import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CollapsibleSection from '../../../components/CollapsibleSection';
import {translateLocal} from '../../../libs/translate';

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

const getTermsSection = () => termsData.map(data => (
    <CollapsibleSection title={data.sectionTitle} key={data.sectionTitle}>
        <View style={[styles.flex1, styles.flexRow, styles.borderBottom]}>
            <View style={[styles.flex1, styles.borderRight, styles.alignItemsCenter, styles.pb2, styles.pt1]}>
                <Text>{translateLocal('termsStep.longTermsForm.typeOfFeeHeader')}</Text>
            </View>
            <View style={[styles.flex1, styles.borderRight, styles.alignItemsCenter, styles.pb2, styles.pt1]}>
                <Text>{translateLocal('termsStep.longTermsForm.feeAmountHeader')}</Text>
            </View>
            <View style={[styles.flex1, styles.alignItemsCenter, styles.pb2, styles.pt1]}>
                <Text>{translateLocal('termsStep.longTermsForm.moreDetailsHeader')}</Text>
            </View>
        </View>
        <View style={[styles.flex1, styles.flexRow, styles.mb4]}>
            <View style={[styles.flex1, styles.borderRight, styles.pb1, styles.pt2, styles.termsTableItem]}>
                <Text>{data.typeOfFee}</Text>
            </View>
            <View style={[styles.flex1, styles.borderRight, styles.pb1, styles.pt2, styles.termsTableItem]}>
                <Text>{data.feeAmount}</Text>
            </View>
            <View style={[styles.flex1, styles.pb1, styles.pt2, styles.termsTableItem]}>
                <Text>{data.moreDetails}</Text>
            </View>
        </View>
    </CollapsibleSection>
));

const LongTermsForm = () => (
    <View style={[styles.mt4, styles.pt4, styles.termsRow]}>
        <Text style={[styles.pb4]}>
            {translateLocal('termsStep.longTermsForm.listOfAllFees')}
        </Text>
        <View style={styles.termsSection} />
        {getTermsSection()}
    </View>
);

LongTermsForm.displayName = 'LongTermsForm';
export default LongTermsForm;
