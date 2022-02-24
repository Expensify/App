import React from 'react';
import {
    View,
} from 'react-native';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';

const propTypes = {
    ...withLocalizePropTypes,
};

const FailedKYC = props => (
    <View style={[styles.flex1]}>
        <View style={[styles.ph5]}>
            <Text style={styles.mb3}>
                {props.translate('additionalDetailsStep.failedKYCText')}
            </Text>
        </View>
    </View>
);

FailedKYC.propTypes = propTypes;
FailedKYC.displayName = 'FailedKYC';

export default withLocalize(FailedKYC);
