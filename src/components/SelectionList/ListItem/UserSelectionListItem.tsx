import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import TextWithTooltip from '@components/TextWithTooltip';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {areEmailsFromSamePrivateDomain} from '@libs/LoginUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import SelectableListItem from './SelectableListItem';
import type {ListItem, UserSelectionListItemProps} from './types';

/**
 * A compact single-line row with avatar, display name, and handle side by side. Used for
 * user selection in search participant filters.
 */
function UserSelectionListItem<TItem extends ListItem>({
    item,
    isFocused,
    isFocusVisible,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onSelectionButtonPress,
    onDismissError,
    shouldPreventEnterKeySubmit,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    pressableStyle,
}: UserSelectionListItemProps<TItem>) {
    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {formatPhoneNumber} = useLocalize();

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
        <SelectableListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.sidebarLinkInner, styles.userSelectNone, wrapperStyle]}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onSelectionButtonPress={onSelectionButtonPress}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={item.rightElement}
            errors={item.errors}
            pendingAction={item.pendingAction}
            pressableStyle={pressableStyle}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.h13, styles.gap3]}>
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
                        style={[styles.flexShrink0, styles.optionDisplayName, isFocusVisible ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.sidebarLinkTextBold, styles.pre]}
                    />
                    {!!userHandle && (
                        <TextWithTooltip
                            text={`@${userHandle}`}
                            shouldShowTooltip={showTooltip}
                            style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.flexShrink1]}
                        />
                    )}
                </View>
            </View>
        </SelectableListItem>
    );
}

export default UserSelectionListItem;
