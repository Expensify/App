import ListItemComposed from '@components/SelectionList/ListItemComposed';
import {useListItemContext} from '@components/SelectionList/ListItemContext';
import getAccessibilityLabel from '@components/SelectionList/utils/getAccessibilityLabel';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

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
    forwardedFSClass?: ForwardedFSClassProps['forwardedFSClass'];
};

/**
 * Shared inner content for UserListItem and BareUserListItem.
 * Renders the avatar, display name, alternate text, rightElement, and optional right caret.
 * The outer pressable wrapper (SelectableListItem or ListItemComposed) is the caller's responsibility
 * and provides the focus/hover/tooltip state through ListItemContext.
 */
function UserListItemContent<TItem extends ListItem>({item, forwardedFSClass}: UserListItemContentProps<TItem>) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {shouldShowTooltip, shouldDisableAccessibleGrouping} = useListItemContext();

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

    const fallbackDisplayName = item.text ?? item.alternateText ?? undefined;

    // A report resolves its own avatars, so it keeps going through `ReportAvatar`, otherwise using Account/Policy.
    let avatar: React.ReactNode;
    if (reportExists) {
        avatar = (
            <ListItemComposed.ReportAvatar
                reportID={item.reportID}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    } else if (policyID) {
        avatar = (
            <ListItemComposed.WorkspaceAvatar
                policyID={policyID}
                accountID={itemAccountID}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    } else if (itemAccountID) {
        avatar = (
            <ListItemComposed.UserAvatar
                accountID={itemAccountID}
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
            {avatar}
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                <TextWithTooltip
                    shouldShowTooltip={shouldShowTooltip}
                    text={Str.isSMSLogin(item.text ?? '') ? formatPhoneNumber(item.text ?? '') : (item.text ?? '')}
                    style={[styles.optionDisplayName, styles.sidebarLinkText, item.isBold !== false && styles.sidebarLinkTextBold, styles.pre, item.alternateText ? styles.mb1 : null]}
                />
                {!!item.alternateText && (
                    <ListItemComposed.Subtitle
                        text={Str.isSMSLogin(item.alternateText ?? '') ? formatPhoneNumber(item.alternateText ?? '') : (item.alternateText ?? '')}
                        forwardedFSClass={forwardedFSClass}
                    />
                )}
            </View>
            {item.rightElement}
            {!!item.shouldShowRightCaret && <ListItemComposed.RightCaret />}
        </View>
    );
}

export default UserListItemContent;
