import React from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const UnreadActionIndicator = props => (
    <View style={styles.unreadIndicatorContainer}>
        <View style={styles.unreadIndicatorLine} />
        <Text style={styles.unreadIndicatorText}>
            {props.translations.translate('new')}
        </Text>
    </View>
);

const propTypes = {
    ...withLocalizePropTypes,
};

UnreadActionIndicator.propTypes = propTypes;

UnreadActionIndicator.displayName = 'UnreadActionIndicator';
export default withLocalize(UnreadActionIndicator);
