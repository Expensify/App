import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CollapsibleSection from '../../../components/CollapsibleSection';

const termsData = [
    {
        key: 'OpeningAccountLongTerms',
        sectionTitle: 'Opening An Account',
        typeOfFee: 'Opening An Account',
        feeAmount: '$0',
        moreDetails: 'There is no fee to create an account.',
    },
];

const getTermsSection = () => termsData.map(data => (
    <View style={styles.mb4} key={data.key}>
        <View style={[styles.flex1, styles.flexRow, styles.borderBottom]}>
            <View style={[styles.flex1, styles.borderRight, styles.alignItemsCenter, styles.pb2, styles.pt1]}>
                <Text>Type of Fee</Text>
            </View>
            <View style={[styles.flex1, styles.borderRight, styles.alignItemsCenter, styles.pb2, styles.pt1]}>
                <Text>Fee Amount</Text>
            </View>
            <View style={[styles.flex1, styles.alignItemsCenter, styles.pb2, styles.pt1]}>
                <Text>More Details</Text>
            </View>
        </View>
        <View style={[styles.flex1, styles.flexRow]}>
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
    </View>
));

const LongTermsForm = () => (
    <View style={[styles.mt4, styles.pt4, styles.termsRow]}>
        <Text style={[styles.pb4]}>
            A list of all Expensify Payments Account fees:
        </Text>
        <View style={styles.termsSection} />
        <CollapsibleSection title="Opening An Account">
            {getTermsSection()}
        </CollapsibleSection>
    </View>
);

LongTermsForm.displayName = 'LongTermsForm';

export default LongTermsForm;
