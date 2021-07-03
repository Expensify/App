import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CollapsibleSection from '../../../components/CollapsibleSection';

const LongTermsForm = () => (
    <View style={styles.m4}>
        <CollapsibleSection title="Opening An Account">
            <View style={[styles.p2, styles.mb2]}>
                <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginBottom: 10}}>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text>Type of Fee</Text>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text>Fee Amount</Text>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text>More Details</Text>
                    </View>
                </View>
                <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row'}}>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text>Opening an Account</Text>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text>$0</Text>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text>There is no monthly usage fee</Text>
                    </View>
                </View>
            </View>
        </CollapsibleSection>
    </View>
);

LongTermsForm.displayName = 'LongTermsForm';

export default LongTermsForm;
