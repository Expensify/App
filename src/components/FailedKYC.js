import React from 'react';
import {
    View,
} from 'react-native';
import Text from './Text';


class FailedKYC extends React.Component {
    render() {
        return (
            <View style={[styles.flex1]}>
                <View style={[styles.ph5]}>
                    <Text style={styles.mb3}>
                        We weren't able to successfully verify your identity. Please try again later and reach out to concierge@expensify.com if you have any questions.
                    </Text>
                </View>
            </View>
        );
    }
}
