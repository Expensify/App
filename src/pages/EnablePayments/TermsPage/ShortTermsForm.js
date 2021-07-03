import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';

const ShortTermsForm = () => (
    <>
        <View style={[styles.p2, styles.mb5]}>
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

        <View style={[styles.shortTermsRow, styles.flexRow]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text>ATM balance inquiry</Text>
                <Text>(in-network or out-of-network)</Text>
            </View>
            <View style={[styles.flex1, styles.p2]}>
                <Text>N/A</Text>
            </View>
        </View>
    </>
);

ShortTermsForm.displayName = 'ShortTermsForm';

export default ShortTermsForm;
