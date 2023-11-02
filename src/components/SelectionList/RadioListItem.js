import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import styles from '@styles/styles';
import {radioListItemPropTypes} from './selectionListPropTypes';

function RadioListItem({item, isFocused = false}) {
    return (
        <View style={[styles.flex1, styles.alignItemsStart]}>
            <Text style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, item.isSelected && styles.sidebarLinkTextBold]}>{item.text}</Text>

            {Boolean(item.alternateText) && (
                <Text style={[isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}>{item.alternateText}</Text>
            )}
        </View>
    );
}

RadioListItem.displayName = 'RadioListItem';
RadioListItem.propTypes = radioListItemPropTypes;

export default RadioListItem;
