import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {areEmailsFromSamePrivateDomain} from '@libs/LoginUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ListItem, UserSelectionListItemProps} from './types';

import SelectableListItem from './SelectableListItem';

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
    const {formatPhoneNumber, translate} = useLocalize();

    const login = item.login ?? '';

    // When the emails share a private domain we can strip the domain and show just the username. Otherwise show the full email.
    const userHandle = areEmailsFromSamePrivateDomain(login, currentUserPersonalDetails.login ?? '') ? login.split('@').at(0) : formatPhoneNumber(login);

    const userDisplayName = getDisplayNameForParticipant({
        accountID: item.accountID ?? CONST.DEFAULT_NUMBER_ID,
        formatPhoneNumber,
        translate,
    });

    const icon = item.icons?.at(0);

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
            pressableStyle={pressableStyle}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.h13, styles.gap3]}>
                {!!icon && <ListItemComposed.CompactAvatar icon={icon} />}

                <View style={[styles.flex1, styles.flexRow, styles.gap2, styles.flexShrink1, styles.alignItemsCenter]}>
                    <ListItemComposed.Title
                        text={userDisplayName}
                        style={styles.flexShrink0}
                    />
                    {!!userHandle && (
                        <ListItemComposed.Subtitle
                            text={`@${userHandle}`}
                            style={styles.flexShrink1}
                        />
                    )}
                </View>
            </View>
        </SelectableListItem>
    );
}

export default UserSelectionListItem;
