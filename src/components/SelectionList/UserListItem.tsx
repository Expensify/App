import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, UserListItemProps} from './types';

function UserListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    pressableStyle,
    shouldUseDefaultRightHandSideCheckmark,
    shouldDisplayRBR,
}: UserListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

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
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, wrapperStyle]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            pressableStyle={pressableStyle}
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
            shouldDisplayRBR={shouldDisplayRBR}
        >
            {(hovered?: boolean) => (
                <>
                    {!shouldUseDefaultRightHandSideCheckmark && !!canSelectMultiple && (
                        <PressableWithFeedback
                            accessibilityLabel={item.text ?? ''}
                            role={CONST.ROLE.BUTTON}
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            disabled={isDisabled || item.isDisabledCheckbox}
                            onPress={handleCheckboxPress}
                            style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, styles.mr3]}
                        >
                            <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}>
                                {!!item.isSelected && (
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
                    {(!!item.reportID || !!item.accountID || !!item.policyID) && (
                        <ReportActionAvatars
                            subscriptAvatarBorderColor={hovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                            shouldShowTooltip={showTooltip}
                            secondaryAvatarContainerStyle={[
                                StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                            ]}
                            reportID={item.reportID}
                            accountIDs={[Number(item.accountID)]}
                            policyID={!item.reportID && !item.accountID ? item.policyID : undefined}
                            singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
                            fallbackDisplayName={item.text ?? item.alternateText ?? undefined}
                        />
                    )}
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
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
                        {!!item.alternateText && (
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={Str.removeSMSDomain(item.alternateText ?? '')}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        )}
                    </View>
                    {!!item.rightElement && item.rightElement}
                    {!!item.shouldShowRightIcon && (
                        <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, isDisabled && styles.cursorDisabled]}>
                            <Icon
                                src={Expensicons.ArrowRight}
                                fill={StyleUtils.getIconFillColor(getButtonState(hovered, false, false, !!isDisabled, item.isInteractive !== false))}
                            />
                        </View>
                    )}
                    {!!shouldUseDefaultRightHandSideCheckmark && !!canSelectMultiple && (
                        <PressableWithFeedback
                            accessibilityLabel={item.text ?? ''}
                            role={CONST.ROLE.BUTTON}
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            disabled={isDisabled || item.isDisabledCheckbox}
                            onPress={handleCheckboxPress}
                            style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, styles.ml3]}
                        >
                            <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}>
                                {!!item.isSelected && (
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
                </>
            )}
        </BaseListItem>
    );
}

UserListItem.displayName = 'UserListItem';

export default UserListItem;
