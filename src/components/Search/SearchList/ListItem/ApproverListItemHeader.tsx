import UserAvatar from '@components/Avatar/UserAvatar';
import Checkbox from '@components/Checkbox';
import type {SearchColumnType} from '@components/Search/types';
import type {ListItem} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import type {TransactionApproverGroupListItemType} from './types';

import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import TextCell from './TextCell';
import TotalCell from './TotalCell';

type ApproverListItemHeaderProps = {
    approver: TransactionApproverGroupListItemType;
    onCheckboxPress?: (item: ListItem) => void;

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

/**
 * Kept non-generic so OXC's React Compiler can memoize the component.
 * OXC bails on type params inside components ("Unsupported declaration type for hoisting").
 */
function ApproverListItemHeader({
    approver: approverItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
    isLargeScreenWidth,
}: ApproverListItemHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const formattedDisplayName = temporaryGetDisplayNameOrDefault({
        passedPersonalDetails: approverItem,
        translate,
        formatPhoneNumber,
    });
    const formattedLogin = formatPhoneNumber(approverItem.login ?? '');

    const columnComponents: Partial<Record<SearchColumnType, ReactNode>> = {
        [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.AVATAR}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR)}
            >
                <UserDetailsTooltip accountID={approverItem.accountID}>
                    <View>
                        <UserAvatar
                            source={approverItem.avatar}
                            accountID={approverItem.accountID}
                            size={CONST.AVATAR_SIZE.SMALL}
                        />
                    </View>
                </UserDetailsTooltip>
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVER]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVER}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVER)}
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
                <TextCell text={String(approverItem.count)} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, {shouldRemoveTotalColumnFlex: true})}
            >
                <TotalCell
                    total={approverItem.total}
                    currency={approverItem.currency}
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
                            onPress={() => onCheckboxPress?.(approverItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            disabled={!!isDisabled || approverItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                            containerStyle={styles.m0}
                        />
                    )}
                    {!isLargeScreenWidth && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <UserDetailsTooltip accountID={approverItem.accountID}>
                                <View>
                                    <UserAvatar
                                        source={approverItem.avatar}
                                        accountID={approverItem.accountID}
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
                            total={approverItem.total}
                            currency={approverItem.currency}
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

export default ApproverListItemHeader;
