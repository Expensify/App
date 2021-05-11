import React from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const UnreadActionIndicator = props => (
    <View style={styles.unreadIndicatorContainer}>
        <View style={styles.unreadIndicatorLine} />
        <Text style={styles.unreadIndicatorText}>
            {props.translate('common.new')}
        </Text>
    </View>
);

UnreadActionIndicator.propTypes = {...withLocalizePropTypes};

UnreadActionIndicator.displayName = 'UnreadActionIndicator';
export default withLocalize(UnreadActionIndicator);
