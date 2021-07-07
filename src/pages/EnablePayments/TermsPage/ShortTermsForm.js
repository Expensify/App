import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';

const ShortTermsForm = () => (
    <>
        <View style={[styles.mb5]}>
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
                        <Text style={[styles.textMicro]}>in-network</Text>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text>N/A</Text>
                        <Text style={[styles.textMicro]}>out-of-network</Text>
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
                <Text style={[styles.textMicro]}>(in-network or out-of-network)</Text>
            </View>
            <View style={[styles.flex1, styles.p2]}>
                <Text>N/A</Text>
            </View>
        </View>
        <View style={[styles.shortTermsRow, styles.flexRow]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text>Customer Service</Text>
                <Text style={[styles.textMicro]}>(automated or live agent)</Text>
            </View>
            <View style={[styles.flex1, styles.p2]}>
                <Text>$0</Text>
            </View>
        </View>
        <View style={[styles.shortTermsRow, styles.flexRow, styles.mb2]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text>Inactivity</Text>
                <Text style={[styles.textMicro]}>(after 12 months with no transactions)</Text>
            </View>
            <View style={[styles.flex1, styles.p2]}>
                <Text>$0</Text>
            </View>
        </View>
        <View style={[styles.shortTermsBoldRow, styles.flexRow]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text style={[styles.h3]}>We charge 1 type of fee.</Text>
            </View>
        </View>
        <View style={[styles.shortTermsRow, styles.flexRow]}>
            <View style={[styles.flex4, styles.p2]}>
                <Text>Electronic Funds withdrawal</Text>
                <Text style={[styles.textMicro]}>(instant)</Text>
            </View>
            <View style={[styles.flex1, styles.p2]}>
                <Text>1.5% (min. $0.25)</Text>
            </View>
        </View>

        <View style={[styles.shortTermsRow, styles.pt4]}>
            <Text style={styles.textStrong}>No overdraft/credit feature.</Text>
            <Text style={styles.mb3}>Your funds are elligible for FDIC insurance.</Text>
            <Text style={styles.mb3}>
                For general information about prepaid accounts, visit
                {' '}
                <TextLink href="https://cfpb.gov/prepaid">
                    cfpb.gov/prepaid
                </TextLink>
                {'.'}
            </Text>
            <Text>Find details and conditions for all fees and services by visiting
                {' '}
                <TextLink href="https://use.expensify.com/fees">
                    use.expensify.com/fees
                </TextLink>
                {' '}
                or calling +1 833-400-0904.
            </Text>
        </View>
    </>
);

ShortTermsForm.displayName = 'ShortTermsForm';

export default ShortTermsForm;
