import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';
import {radioListItemPropTypes} from './selectionListPropTypes';

function RadioListItem({item, isFocused = false}) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flex1, styles.alignItemsStart]}>
            <Text
                style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, item.isSelected && styles.sidebarLinkTextBold, styles.pre]}
                numberOfLines={1}
            >
                {item.text}
            </Text>

            {Boolean(item.alternateText) && (
                <Text
                    style={[isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]}
                    numberOfLines={1}
                >
                    {item.alternateText}
                </Text>
            )}
        </View>
    );
}

RadioListItem.displayName = 'RadioListItem';
RadioListItem.propTypes = radioListItemPropTypes;

export default RadioListItem;
