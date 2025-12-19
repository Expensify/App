import {Str} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import TextWithTooltip from '@components/TextWithTooltip';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {areEmailsFromSamePrivateDomain} from '@libs/LoginUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, UserSelectionListItemProps} from './types';

function UserSelectionListItem<TItem extends ListItem>({
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
}: UserSelectionListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);
    const {formatPhoneNumber} = useLocalize();

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    const userHandle = useMemo(() => {
        const login = item.login ?? '';

        // If the emails are not in the same private domain, we just return the users email
        if (!areEmailsFromSamePrivateDomain(login, currentUserPersonalDetails.login ?? '')) {
            return Str.removeSMSDomain(login);
        }

        // Otherwise, the emails are a part of the same private domain, so we can remove the domain and just show username
        return login.split('@').at(0);
    }, [currentUserPersonalDetails.login, item.login]);

    const userDisplayName = useMemo(() => {
        return getDisplayNameForParticipant({
            accountID: item.accountID ?? CONST.DEFAULT_NUMBER_ID,
            formatPhoneNumber,
        });
    }, [formatPhoneNumber, item.accountID]);

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.sidebarLinkInner, styles.userSelectNone, wrapperStyle]}
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
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.h13, styles.gap3, styles.w100]}>
                {!!item.icons?.length && (
                    <View style={styles.mentionSuggestionsAvatarContainer}>
                        <Avatar
                            source={item.icons.at(0)?.source}
                            size={CONST.AVATAR_SIZE.SMALLER}
                            name={item.icons.at(0)?.name}
                            avatarID={item.icons.at(0)?.id}
                            type={item.icons.at(0)?.type ?? CONST.ICON_TYPE_AVATAR}
                            fallbackIcon={item.icons.at(0)?.fallbackIcon}
                        />
                    </View>
                )}

                <View style={[styles.flex1, styles.flexRow, styles.gap2, styles.flexShrink1, styles.alignItemsCenter]}>
                    <TextWithTooltip
                        shouldShowTooltip={showTooltip}
                        text={userDisplayName}
                        style={[styles.flexShrink0, styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.sidebarLinkTextBold, styles.pre]}
                    />
                    {!!userHandle && (
                        <TextWithTooltip
                            text={`@${userHandle}`}
                            shouldShowTooltip={showTooltip}
                            style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.flexShrink1]}
                        />
                    )}
                </View>

                <PressableWithFeedback
                    accessibilityLabel={item.text ?? ''}
                    role={CONST.ROLE.BUTTON}
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    disabled={isDisabled || item.isDisabledCheckbox}
                    onPress={handleCheckboxPress}
                    style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, !!item.rightElement && styles.mr3]}
                >
                    <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}>
                        {!!item.isSelected && (
                            <Icon
                                src={icons.Checkmark}
                                fill={theme.textLight}
                                height={14}
                                width={14}
                            />
                        )}
                    </View>
                </PressableWithFeedback>

                {!!item.rightElement && item.rightElement}
            </View>
        </BaseListItem>
    );
}

export default UserSelectionListItem;
