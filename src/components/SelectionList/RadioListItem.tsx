import React, {useCallback} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {RadioListItemProps} from './types';

function RadioListItem({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    shouldPreventDefaultFocusOnSelectRow,
    rightHandSideComponent,
    isMultilineSupported = false,
}: RadioListItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow, isFocused && styles.sidebarLinkActive]}
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
            <>
                {canSelectMultiple && (
                    <PressableWithFeedback
                        accessibilityLabel={item.text ?? ''}
                        role={CONST.ROLE.BUTTON}
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        disabled={isDisabled || item.isDisabledCheckbox}
                        onPress={handleCheckboxPress}
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                    >
                        <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}>
                            {item.isSelected && (
                                <Icon
                                    src={Expensicons.Checkmark}
                                    fill={theme.textLight}
                                    height={14}
                                    width={14}
                                />
                            )}
                        </View>
                    </PressableWithFeedback>
                )}
                <View style={[styles.flex1, styles.alignItemsStart]}>
                    <TextWithTooltip
                        shouldShowTooltip={showTooltip}
                        text={item.text ?? ''}
                        style={[
                            styles.optionDisplayName,
                            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                            styles.sidebarLinkTextBold,
                            isMultilineSupported ? styles.preWrap : styles.pre,
                            item.alternateText ? styles.mb1 : null,
                        ]}
                        numberOfLines={isMultilineSupported ? 2 : 1}
                    />

                    {!!item.alternateText && (
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip}
                            text={item.alternateText}
                            style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                        />
                    )}
                </View>
                {!!item.rightElement && item.rightElement}
            </>
        </BaseListItem>
    );
}

RadioListItem.displayName = 'RadioListItem';

export default RadioListItem;
