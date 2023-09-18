import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import styles from '../../styles/styles';
import Text from '../Text';
import {userListItemPropTypes} from './selectionListPropTypes';
import Avatar from '../Avatar';
import OfflineWithFeedback from '../OfflineWithFeedback';
import CONST from '../../CONST';
import * as StyleUtils from '../../styles/StyleUtils';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import themeColors from '../../styles/themes/default';
import Tooltip from '../Tooltip';
import UserDetailsTooltip from '../UserDetailsTooltip';

function UserListItem({item, isFocused = false, showTooltip, onSelectRow, onDismissError = () => {}}) {
    const hasError = !_.isEmpty(item.errors);

    const avatar = (
        <Avatar
            containerStyles={styles.pl3}
            source={lodashGet(item, 'avatar.source', '')}
            name={lodashGet(item, 'avatar.name', item.text)}
            type={lodashGet(item, 'avatar.type', CONST.ICON_TYPE_AVATAR)}
        />
    );

    const text = (
        <Text
            style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.sidebarLinkTextBold]}
            numberOfLines={1}
        >
            {item.text}
        </Text>
    );

    const alternateText = (
        <Text
            style={[isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
            numberOfLines={1}
        >
            {item.alternateText}
        </Text>
    );

    return (
        <OfflineWithFeedback
            onClose={() => onDismissError(item)}
            pendingAction={item.pendingAction}
            errors={item.errors}
            errorRowStyles={styles.ph5}
        >
            <PressableWithFeedback
                style={[styles.peopleRow, styles.userSelectNone, isFocused && styles.sidebarLinkActive, hasError && styles.borderColorDanger]}
                onPress={() => onSelectRow(item)}
                disabled={item.isDisabled}
                accessibilityLabel={item.text}
                accessibilityRole="checkbox"
                accessibilityState={{checked: item.isSelected}}
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                focusStyle={styles.hoveredComponentBG}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                <View style={styles.checkboxPressable}>
                    <View
                        style={[
                            StyleUtils.getCheckboxContainerStyle(20, 4),
                            item.isSelected && styles.checkedContainer,
                            item.isSelected && styles.borderColorFocus,
                            item.isDisabled && styles.cursorDisabled,
                            item.isDisabled && styles.buttonOpacityDisabled,
                        ]}
                    >
                        {item.isSelected && (
                            <Icon
                                src={Expensicons.Checkmark}
                                fill={themeColors.textLight}
                                height={14}
                                width={14}
                            />
                        )}
                    </View>
                </View>
                {Boolean(item.avatar) &&
                    (showTooltip ? (
                        <UserDetailsTooltip
                            accountID={item.accountID}
                            shiftHorizontal={styles.pl3.paddingLeft / 2}
                        >
                            <View>{avatar}</View>
                        </UserDetailsTooltip>
                    ) : (
                        avatar
                    ))}
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.pl3, styles.optionRow]}>
                    {showTooltip ? <Tooltip text={item.text}>{text}</Tooltip> : text}
                    {Boolean(item.alternateText) && (showTooltip ? <Tooltip text={item.alternateText}>{alternateText}</Tooltip> : alternateText)}
                </View>
                {Boolean(item.rightElement) && item.rightElement}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

UserListItem.displayName = 'UserListItem';
UserListItem.propTypes = userListItemPropTypes;

export default UserListItem;
