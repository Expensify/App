import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@styles/useThemeStyles';
import {radioListItemPropTypes} from './selectionListPropTypes';

function RadioListItem({item, isFocused = false, showTooltip}) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flex1, styles.alignItemsStart]}>
            <Tooltip
                shouldRender={showTooltip}
                text={item.text}
            >
                <Text
                    style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, item.isSelected && styles.sidebarLinkTextBold, styles.pre]}
                    numberOfLines={1}
                >
                    {item.text}
                </Text>
            </Tooltip>

            {Boolean(item.alternateText) && (
                <Tooltip
                    shouldRender={showTooltip}
                    text={item.alternateText}
                >
                    <Text
                        style={[isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]}
                        numberOfLines={1}
                    >
                        {item.alternateText}
                    </Text>
                </Tooltip>
            )}
        </View>
    );
}

RadioListItem.displayName = 'RadioListItem';
RadioListItem.propTypes = radioListItemPropTypes;

export default RadioListItem;
