import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CollapsibleSection from '../../../components/CollapsibleSection';

const LongTermsForm = () => (
    <View style={[styles.mt4, styles.pt4, styles.termsRow]}>
        <Text style={styles.mb4}>
            A list of all Expensify Payments Account fees:
        </Text>
        <CollapsibleSection title="Opening An Account">
            <View style={styles.mb2}>
                <View style={[styles.flex1, styles.flexRow, styles.mb3]}>
                    <View style={styles.flex1}>
                        <Text>Type of Fee</Text>
                    </View>
                    <View style={styles.flex1}>
                        <Text>Fee Amount</Text>
                    </View>
                    <View style={styles.flex1}>
                        <Text>More Details</Text>
                    </View>
                </View>
                <View style={[styles.flex1, styles.flexRow]}>
                    <View style={styles.flex1}>
                        <Text>Opening an Account</Text>
                    </View>
                    <View style={styles.flex1}>
                        <Text>$0</Text>
                    </View>
                    <View style={styles.flex1}>
                        <Text>There is no monthly usage fee.</Text>
                    </View>
                </View>
            </View>
        </CollapsibleSection>
    </View>
);

LongTermsForm.displayName = 'LongTermsForm';

export default LongTermsForm;
