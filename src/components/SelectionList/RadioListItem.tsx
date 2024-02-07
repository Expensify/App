import React from 'react';
import {View} from 'react-native';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import type {RadioListItemProps} from './types';

function RadioListItem({item, showTooltip, textStyles, alternateTextStyles}: RadioListItemProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.alignItemsStart]}>
            <TextWithTooltip
                shouldShowTooltip={showTooltip}
                text={item.text}
                textStyles={textStyles}
            />

            {!!item.alternateText && (
                <TextWithTooltip
                    shouldShowTooltip={showTooltip}
                    text={item.alternateText}
                    textStyles={alternateTextStyles}
                />
            )}
        </View>
    );
}

RadioListItem.displayName = 'RadioListItem';

export default RadioListItem;
