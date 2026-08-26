import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import PolicyAvatar from '@components/Avatar/connected/PolicyAvatar';
import {AvatarTooltipsProvider} from '@components/Avatar/tooltips/AvatarTooltipContext';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import {ListItemContext} from '@components/SelectionList/ListItemContext';
import getAccessibilityLabel from '@components/SelectionList/utils/getAccessibilityLabel';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import getButtonState from '@libs/getButtonState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

import type {ListItem} from './types';

const reportExistsSelector = (report: OnyxEntry<Report>) => !!report;

type UserListItemContentProps<TItem extends ListItem> = {
    item: TItem;
    isFocused?: boolean;
    showTooltip: boolean;
    isDisabled?: boolean | null;
    shouldDisableHoverStyle?: boolean;
    /** Pre-computed flag: true when a separate right-side interactive element exists that VoiceOver should focus independently. */
    shouldDisableAccessibleGrouping: boolean;
    forwardedFSClass?: ForwardedFSClassProps['forwardedFSClass'];
    /** Current hover state, forwarded from the parent's render-prop child. */
    hovered: boolean;
};

/**
 * Shared inner content for UserListItem and BareUserListItem.
 * Renders the avatar, display name, alternate text, rightElement, and optional right caret.
 * The outer pressable wrapper (SelectableListItem or BaseListItem) is the caller's responsibility.
 */
function UserListItemContent<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip: shouldShowTooltip,
    isDisabled,
    shouldDisableHoverStyle,
    shouldDisableAccessibleGrouping,
    forwardedFSClass,
    hovered,
}: UserListItemContentProps<TItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Checkmark']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- some utils that are used to get reportID return empty string "", which would make subscription to the whole collection with nullish coalescing operator, example of this could be found in NewChatPage.tsx where some hooks return reportID as empty strings
    const [isReportInOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${item.reportID || undefined}`, {
        selector: reportExistsSelector,
    });

    const reportExists = isReportInOnyx && !!item.reportID;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- accountID being 0 is also not valid, so we prefer to use the icon ID if it exists
    const itemAccountID = Number(item.accountID || item.icons?.at(1)?.id) || 0;

    const isThereOnlyWorkspaceIcon = item.icons?.length === 1 && item.icons?.at(0)?.type === CONST.ICON_TYPE_WORKSPACE;
    const shouldUseIconPolicyID = !item.reportID && !item.accountID && !item.policyID;
    const policyID = isThereOnlyWorkspaceIcon && shouldUseIconPolicyID ? String(item.icons?.at(0)?.id) : item.policyID;

    const isHovered = hovered && !shouldDisableHoverStyle;
    const fallbackDisplayName = item.text ?? item.alternateText ?? undefined;

    // A report resolves its own avatars, so it keeps going through `ReportActionAvatars`, otherwise using Account/Policy.
    let avatar: React.ReactNode;
    if (reportExists) {
        avatar = (
            <ReportActionAvatars
                subscriptAvatarBorderColor={isHovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                secondaryAvatarContainerStyle={[
                    StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                    isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                    isHovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                ]}
                reportID={item.reportID}
                singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    } else if (policyID) {
        avatar = (
            <PolicyAvatar
                policyID={policyID}
                accountID={itemAccountID}
                containerStyle={[styles.actionAvatar, styles.mr3]}
                subscriptAvatarBorderColor={isHovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    } else if (itemAccountID) {
        avatar = (
            <AccountAvatar
                accountID={itemAccountID}
                containerStyle={[styles.actionAvatar, styles.mr3]}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    const baseAccessibilityLabel = getAccessibilityLabel(item);
    const accessibilityLabel =
        shouldDisableAccessibleGrouping && item.isSelected !== undefined
            ? `${translate(item.isSelected ? 'common.deselect' : 'common.select')}, ${baseAccessibilityLabel}`
            : baseAccessibilityLabel;

    return (
        <View
            accessible={shouldDisableAccessibleGrouping || undefined}
            accessibilityLabel={shouldDisableAccessibleGrouping ? accessibilityLabel : undefined}
            role={shouldDisableAccessibleGrouping ? CONST.ROLE.BUTTON : undefined}
            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
        >
            {!!avatar && <AvatarTooltipsProvider isEnabled={shouldShowTooltip}>{avatar}</AvatarTooltipsProvider>}
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                <TextWithTooltip
                    shouldShowTooltip={shouldShowTooltip}
                    text={Str.isSMSLogin(item.text ?? '') ? formatPhoneNumber(item.text ?? '') : (item.text ?? '')}
                    style={[styles.optionDisplayName, styles.sidebarLinkText, item.isBold !== false && styles.sidebarLinkTextBold, styles.pre, item.alternateText ? styles.mb1 : null]}
                />
                {!!item.alternateText && (
                    <TextWithTooltip
                        shouldShowTooltip={shouldShowTooltip}
                        text={Str.isSMSLogin(item.alternateText ?? '') ? formatPhoneNumber(item.alternateText ?? '') : (item.alternateText ?? '')}
                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                        forwardedFSClass={forwardedFSClass}
                    />
                )}
            </View>
            {!!item.rightElement && <ListItemContext.Provider value={{isFocused, shouldShowTooltip}}>{item.rightElement}</ListItemContext.Provider>}
            {!!item.shouldShowRightCaret && (
                <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, isDisabled && styles.cursorDisabled]}>
                    <Icon
                        src={icons.ArrowRight}
                        fill={StyleUtils.getIconFillColor(getButtonState(isHovered, false, false, !!isDisabled, item.isInteractive !== false))}
                    />
                </View>
            )}
        </View>
    );
}

export default UserListItemContent;
