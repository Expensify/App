import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';

const ShortTermsForm = () => (
    <View style={[styles.p2, styles.border, styles.mb2]}>
        <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginBottom: 10}}>
            <View style={{flex: 1, alignSelf: 'stretch'}}>
                <Text>Monthly Fee</Text>
            </View>
            <View style={{flex: 1, alignSelf: 'stretch'}}>
                <Text>Per Purchase</Text>
            </View>
            <View style={{flex: 1, alignSelf: 'stretch'}}>
                <Text>ATM Withdrawal</Text>
            </View>
            <View style={{flex: 1, alignSelf: 'stretch'}}>
                <Text>Cash Reload</Text>
            </View>
        </View>
        <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row'}}>
            <View style={{flex: 1, alignSelf: 'stretch'}}>
                <Text>$0</Text>
            </View>
            <View style={{flex: 1, alignSelf: 'stretch'}}>
                <Text>$0</Text>
            </View>
            <View style={{flex: 1, alignSelf: 'stretch'}}>
                <View style={{flex: 1, alignSelf: 'stretch'}}>
                    <Text>N/A</Text>
                    <Text>in-network</Text>
                </View>
                <View style={{flex: 1, alignSelf: 'stretch'}}>
                    <Text>N/A</Text>
                    <Text>out-of-network</Text>
                </View>
            </View>
            <View style={{flex: 1, alignSelf: 'stretch'}}>
                <Text>N/A</Text>
            </View>
        </View>
    </View>
);

ShortTermsForm.displayName = 'ShortTermsForm';

export default ShortTermsForm;
