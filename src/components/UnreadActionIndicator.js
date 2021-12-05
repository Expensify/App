import React from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import ExpensifyText from './ExpensifyText';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const UnreadActionIndicator = props => (
    <View style={styles.unreadIndicatorContainer}>
        <View style={styles.unreadIndicatorLine} />
        <ExpensifyText style={styles.unreadIndicatorText}>
            {props.translate('common.new')}
        </ExpensifyText>
    </View>
);

UnreadActionIndicator.propTypes = {...withLocalizePropTypes};

UnreadActionIndicator.displayName = 'UnreadActionIndicator';
export default withLocalize(UnreadActionIndicator);
