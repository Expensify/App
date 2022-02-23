import React from 'react';
import {
    View,
} from 'react-native';
import Text from './Text';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';


class FailedKYC extends React.Component {
    render() {
        return (
            <View style={[styles.flex1]}>
                <View style={[styles.ph5]}>
                    <Text style={styles.mb3}>
                        {this.props.translate('additionalDetailsStep.failedKYCText')}
                    </Text>
                </View>
            </View>
        );
    }
}

export default withLocalize(FailedKYC);