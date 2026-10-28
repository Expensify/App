import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ListItem, ListItemProps} from './types';

import SelectableListItem from './SelectableListItem';

/**
 * A compact row with avatar, display name, and primary login below it. Used for
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
}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {formatPhoneNumber, translate} = useLocalize();

    const userDisplayName = getDisplayNameForParticipant({
        accountID: item.accountID ?? CONST.DEFAULT_NUMBER_ID,
        formatPhoneNumber,
        hiddenTranslation: translate('common.hidden'),
    });

    const primaryLogin = formatPhoneNumber(item.login ?? '');

    // Users without a name already show their login as the display name
    const subtitle = primaryLogin !== userDisplayName ? primaryLogin : '';

    const icon = item.icons?.at(0);

    return (
        <SelectableListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.sidebarLinkInner, styles.userSelectNone, item.itemStyle]}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onSelectionButtonPress={onSelectionButtonPress}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.mnh13, styles.gap3]}>
                {!!icon && <ListItemComposed.CompactAvatar icon={icon} />}

                <ListItemComposed.TextColumn>
                    <ListItemComposed.Title
                        text={userDisplayName}
                        // The login takes the second line, so the name stays on one
                        style={subtitle ? styles.mb1 : styles.preWrap}
                        numberOfLines={subtitle ? 1 : 2}
                    />
                    {!!subtitle && <ListItemComposed.Subtitle text={subtitle} />}
                </ListItemComposed.TextColumn>
            </View>
        </SelectableListItem>
    );
}

export default UserSelectionListItem;
