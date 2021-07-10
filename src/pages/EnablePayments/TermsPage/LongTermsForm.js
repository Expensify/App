import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CollapsibleSection from '../../../components/CollapsibleSection';

const LongTermsForm = () => (
    <View style={[styles.mt4, styles.pt4, styles.termsRow]}>
        <Text style={[styles.pb4, styles.termsSection]}>
            A list of all Expensify Payments Account fees:
        </Text>
        <CollapsibleSection title="Opening An Account">
            <View style={styles.mb4}>
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
                <View style={[styles.flex1, styles.flexRow, styles.justifyContentCenter]}>
                    <View style={[styles.flex1, styles.borderRight, styles.pb1, styles.pt2, styles.termsTableItem]}>
                        <Text>Opening an Account</Text>
                    </View>
                    <View style={[styles.flex1, styles.borderRight, styles.pb1, styles.pt2, styles.termsTableItem]}>
                        <Text>$0</Text>
                    </View>
                    <View style={[styles.flex1, styles.pb1, styles.pt2, styles.termsTableItem]}>
                        <Text>There is no fee to create an account.</Text>
                    </View>
                </View>
            </View>
        </CollapsibleSection>
    </View>
);

LongTermsForm.displayName = 'LongTermsForm';

export default LongTermsForm;
