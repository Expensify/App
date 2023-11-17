import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

function UnreadActionIndicator(props) {
    const styles = useThemeStyles();
    return (
        <View
            accessibilityLabel={props.translate('accessibilityHints.newMessageLineIndicator')}
            data-action-id={props.reportActionID}
            style={[styles.unreadIndicatorContainer, styles.userSelectNone, styles.pointerEventsNone]}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
        >
            <View style={styles.unreadIndicatorLine} />
            <Text style={styles.unreadIndicatorText}>{props.translate('common.new')}</Text>
        </View>
    );
}

UnreadActionIndicator.propTypes = {...withLocalizePropTypes};

UnreadActionIndicator.displayName = 'UnreadActionIndicator';
export default withLocalize(UnreadActionIndicator);
