import React from 'react';
import {View} from 'react-native';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseListItem from './BaseListItem';
import type {BaseListItemProps, ListItem} from './types';

function RadioListItem({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    shouldPreventDefaultFocusOnSelectRow,
    rightHandSideComponent,
}: BaseListItemProps<ListItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow, isFocused && styles.sidebarLinkActive]}
            selectMultipleStyle={[
                StyleUtils.getCheckboxContainerStyle(20),
                styles.mr3,
                item.isSelected && styles.checkedContainer,
                item.isSelected && styles.borderColorFocus,
                item.isDisabled && styles.cursorDisabled,
                item.isDisabled && styles.buttonOpacityDisabled,
            ]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
            rightHandSideComponent={rightHandSideComponent}
            keyForList={item.keyForList}
        >
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
        </BaseListItem>
    );
}

RadioListItem.displayName = 'RadioListItem';

export default RadioListItem;
