import React from 'react';
import {View} from 'react-native';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ListItemProps} from './types';

function RadioListItem({item, isFocused, showTooltip}: ListItemProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.alignItemsStart]}>
            <TextWithTooltip
                shouldShowTooltip={showTooltip}
                text={item.text}
                textStyles={[
                    styles.optionDisplayName,
                    isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                    styles.sidebarLinkTextBold,
                    styles.pre,
                    item.alternateText ? styles.mb1 : null,
                ]}
            />

            {!!item.alternateText && (
                <TextWithTooltip
                    shouldShowTooltip={showTooltip}
                    text={item.alternateText}
                    textStyles={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                />
            )}
        </View>
    );
}

RadioListItem.displayName = 'RadioListItem';

export default RadioListItem;
