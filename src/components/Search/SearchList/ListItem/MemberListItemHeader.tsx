import UserAvatar from '@components/Avatar/UserAvatar';
import Checkbox from '@components/Checkbox';
import type {SearchColumnType} from '@components/Search/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {TransactionApproverGroupListItemType, TransactionMemberGroupListItemType} from './types';

import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import TextCell from './TextCell';
import TotalCell from './TotalCell';

type MemberGroupListItemType = TransactionMemberGroupListItemType | TransactionApproverGroupListItemType;

type MemberListItemHeaderProps = {
    /** The person this group is for: the submitter when grouping by from, the approver when grouping by approver */
    member: MemberGroupListItemType;

    onCheckboxPress?: (item: MemberGroupListItemType) => void;

    /** The column that shows the member's name, which differs between the from and approver groupings */
    nameColumn?: typeof CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM | typeof CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVER;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;

    onDownArrowClick?: () => void;

    /** Whether the down arrow is expanded */
    isExpanded?: boolean;

    /** The visible columns for the header */
    columns?: SearchColumnType[];

    isLargeScreenWidth?: boolean;
};

function MemberListItemHeader({
    member: memberItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
    isLargeScreenWidth,
    nameColumn = CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM,
}: MemberListItemHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const formattedDisplayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: memberItem, translate, formatPhoneNumber});
    const formattedLogin = formatPhoneNumber(memberItem.login ?? '');

    const columnComponents: Partial<Record<SearchColumnType, React.JSX.Element>> = {
        [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.AVATAR}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR)}
            >
                <UserDetailsTooltip accountID={memberItem.accountID}>
                    <View>
                        <UserAvatar
                            source={memberItem.avatar}
                            accountID={memberItem.accountID}
                            size={CONST.AVATAR_SIZE.SMALL}
                        />
                    </View>
                </UserDetailsTooltip>
            </View>
        ),
        [nameColumn]: (
            <View
                key={nameColumn}
                style={StyleUtils.getReportTableColumnStyles(nameColumn)}
            >
                <View style={styles.flexShrink1}>
                    <TextWithTooltip
                        text={formattedDisplayName}
                        style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                        isSelectable
                    />
                    <TextWithTooltip
                        text={formattedLogin || formattedDisplayName}
                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                        isSelectable
                    />
                </View>
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPENSES)}
            >
                <TextCell text={String(memberItem.count)} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, {shouldRemoveTotalColumnFlex: true})}
            >
                <TotalCell
                    total={memberItem.total}
                    currency={memberItem.currency}
                />
            </View>
        ),
    };

    return (
        <View>
            <View style={[styles.flexRow, styles.alignItemsCenter, isLargeScreenWidth ? [styles.pl3, styles.pv1, styles.gap3] : [styles.p4, styles.gap3]]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(memberItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            disabled={!!isDisabled || memberItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                            containerStyle={styles.m0}
                        />
                    )}
                    {!isLargeScreenWidth && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <UserDetailsTooltip accountID={memberItem.accountID}>
                                <View>
                                    <UserAvatar
                                        source={memberItem.avatar}
                                        accountID={memberItem.accountID}
                                    />
                                </View>
                            </UserDetailsTooltip>
                            <View style={[styles.gap1, styles.flexShrink1]}>
                                <TextWithTooltip
                                    text={formattedDisplayName}
                                    style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                                    isSelectable
                                />
                                <TextWithTooltip
                                    text={formattedLogin || formattedDisplayName}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                    isSelectable
                                />
                            </View>
                        </View>
                    )}
                    {!!isLargeScreenWidth && columns?.map((column) => columnComponents[column])}
                </View>
                {!isLargeScreenWidth && (
                    <View style={[styles.flexShrink0, styles.flexRow, styles.alignItemsCenter]}>
                        <TotalCell
                            total={memberItem.total}
                            currency={memberItem.currency}
                        />
                        {!!onDownArrowClick && (
                            <ExpandCollapseArrowButton
                                isExpanded={isExpanded}
                                onPress={onDownArrowClick}
                            />
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

export default MemberListItemHeader;
