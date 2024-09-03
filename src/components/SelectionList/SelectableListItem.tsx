import React, {useCallback} from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SelectCircle from '@components/SelectCircle';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {InviteMemberListItemProps, ListItem} from './types';

function SelectableListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    onFocus,
    shouldSyncFocus,
}: InviteMemberListItemProps<TItem>) {
    const styles = useThemeStyles();
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
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, isFocused && styles.sidebarLinkActive]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <>
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip}
                            text={item.text ?? ''}
                            style={[
                                styles.optionDisplayName,
                                isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                item.isBold !== false && styles.sidebarLinkTextBold,
                                styles.pre,
                                item.alternateText ? styles.mb1 : null,
                            ]}
                        />
                    </View>
                </View>
                {canSelectMultiple && !item.isDisabled && (
                    <PressableWithFeedback
                        onPress={handleCheckboxPress}
                        disabled={isDisabled}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={item.text ?? ''}
                        style={[styles.ml2, styles.optionSelectCircle]}
                    >
                        <SelectCircle
                            isChecked={item.isSelected ?? false}
                            selectCircleStyles={styles.ml0}
                        />
                    </PressableWithFeedback>
                )}
            </>
        </BaseListItem>
    );
}

SelectableListItem.displayName = 'SelectableListItem';

export default SelectableListItem;
