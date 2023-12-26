import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {radioListItemPropTypes} from './selectionListPropTypes';

function RadioListItem({item, textStyles, alternateTextStyles}) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flex1, styles.alignItemsStart]}>
            <Text
                style={textStyles}
                numberOfLines={1}
            >
                {item.text}
            </Text>

            {Boolean(item.alternateText) && (
                <Text
                    style={alternateTextStyles}
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
