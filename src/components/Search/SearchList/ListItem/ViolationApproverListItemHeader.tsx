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

import type {TransactionViolationApproverGroupListItemType} from './types';

import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import TextCell from './TextCell';
import TotalCell from './TotalCell';

type ViolationApproverListItemHeaderProps = {
    violationApprover: TransactionViolationApproverGroupListItemType;
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
function ViolationApproverListItemHeader({
    violationApprover: violationApproverItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
    isLargeScreenWidth,
}: ViolationApproverListItemHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const formattedDisplayName = temporaryGetDisplayNameOrDefault({
        passedPersonalDetails: violationApproverItem,
        translate,
        formatPhoneNumber,
    });
    const formattedLogin = formatPhoneNumber(violationApproverItem.login ?? '');

    const columnComponents: Partial<Record<SearchColumnType, ReactNode>> = {
        [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.AVATAR}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR)}
            >
                <UserDetailsTooltip accountID={violationApproverItem.accountID}>
                    <View>
                        <UserAvatar
                            source={violationApproverItem.avatar}
                            accountID={violationApproverItem.accountID}
                            size={CONST.AVATAR_SIZE.SMALL}
                        />
                    </View>
                </UserDetailsTooltip>
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION_APPROVER]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION_APPROVER}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION_APPROVER)}
            >
                <View style={styles.flexShrink1}>
                    <TextWithTooltip
                        text={formattedDisplayName}
                        style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                    />
                    <TextWithTooltip
                        text={formattedLogin || formattedDisplayName}
                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                    />
                </View>
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPENSES)}
            >
                <TextCell text={String(violationApproverItem.count)} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVAL_COUNT]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVAL_COUNT}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVAL_COUNT)}
            >
                <TextCell text={String(violationApproverItem.approvalCount)} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVED_TOTAL]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVED_TOTAL}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.GROUP_APPROVED_TOTAL, {shouldRemoveTotalColumnFlex: true})}
            >
                <TotalCell
                    total={violationApproverItem.approvedTotal}
                    currency={violationApproverItem.currency}
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
                            onPress={() => onCheckboxPress?.(violationApproverItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            disabled={!!isDisabled || violationApproverItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                            containerStyle={styles.m0}
                        />
                    )}
                    {!isLargeScreenWidth && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <UserDetailsTooltip accountID={violationApproverItem.accountID}>
                                <View>
                                    <UserAvatar
                                        source={violationApproverItem.avatar}
                                        accountID={violationApproverItem.accountID}
                                    />
                                </View>
                            </UserDetailsTooltip>
                            <View style={[styles.gap1, styles.flexShrink1]}>
                                <TextWithTooltip
                                    text={formattedDisplayName}
                                    style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                                />
                                <TextWithTooltip
                                    text={formattedLogin || formattedDisplayName}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                />
                            </View>
                        </View>
                    )}
                    {!!isLargeScreenWidth && columns?.map((column) => columnComponents[column])}
                </View>
                {!isLargeScreenWidth && (
                    <View style={[styles.flexShrink0, styles.flexRow, styles.alignItemsCenter]}>
                        <TotalCell
                            total={violationApproverItem.approvedTotal}
                            currency={violationApproverItem.currency}
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

export default ViolationApproverListItemHeader;
