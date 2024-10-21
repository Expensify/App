import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MultipleAvatars from '@components/MultipleAvatars';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SelectCircle from '@components/SelectCircle';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import BaseListItem from './BaseListItem';
import type {InviteMemberListItemProps, ListItem} from './types';

const fallbackIcon: Icon = {
    source: FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};

function InviteMemberListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
}: InviteMemberListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    const shouldShowCheckBox = canSelectMultiple && !item.isDisabled;

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
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, isFocused && styles.sidebarLinkActive]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            FooterComponent={
                item.invitedSecondaryLogin ? (
                    <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>
                        {translate('workspace.people.invitedBySecondaryLogin', {secondaryLogin: item.invitedSecondaryLogin})}
                    </Text>
                ) : undefined
            }
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            shouldDisplayRBR={!shouldShowCheckBox}
        >
            {(hovered?: boolean) => (
                <>
                    {!!item.icons &&
                        (item.shouldShowSubscript ? (
                            <SubscriptAvatar
                                mainAvatar={item.icons.at(0) ?? fallbackIcon}
                                secondaryAvatar={item.icons.at(1)}
                                showTooltip={showTooltip}
                                backgroundColor={hovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                            />
                        ) : (
                            <MultipleAvatars
                                icons={item.icons}
                                shouldShowTooltip={showTooltip}
                                secondAvatarStyle={[
                                    StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                    isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                    hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                ]}
                            />
                        ))}
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={Str.removeSMSDomain(item.text ?? '')}
                                style={[
                                    styles.optionDisplayName,
                                    isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                    item.isBold !== false && styles.sidebarLinkTextBold,
                                    styles.pre,
                                    item.alternateText ? styles.mb1 : null,
                                ]}
                            />
                        </View>
                        {!!item.alternateText && (
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={Str.removeSMSDomain(item.alternateText ?? '')}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        )}
                    </View>
                    {!!item.rightElement && item.rightElement}
                    {shouldShowCheckBox && (
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
            )}
        </BaseListItem>
    );
}

InviteMemberListItem.displayName = 'InviteMemberListItem';

export default InviteMemberListItem;
