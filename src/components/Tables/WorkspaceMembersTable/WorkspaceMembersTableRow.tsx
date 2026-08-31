import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import Icon from '@components/Icon';
import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {COPYABLE_ROW_DATA_SET, COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {WorkspaceMemberRowData} from '.';

type WorkspaceMembersTableRowProps = {
    /** The member item for the row */
    item: WorkspaceMemberRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Whether the custom field 1 column is visible on web screens or not */
    shouldShowCustomField1Column: boolean;

    /** Whether the custom field 2 column is visible on web screens or not */
    shouldShowCustomField2Column: boolean;
};

export default function WorkspaceMembersTableRow({item, rowIndex, shouldShowCustomField1Column, shouldShowCustomField2Column, shouldUseNarrowTableLayout}: WorkspaceMembersTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const roleLabel = translate('workspace.common.roleName', item.role);
    const accessibilityLabel = `${item.name}, ${item.email}, ${roleLabel}`;
    const memberSubtitle = !shouldUseNarrowTableLayout ? item.email : `${roleLabel} • ${item.email}`;

    return (
        <Table.Row
            interactive
            shouldAllowTextSelection
            dataSet={COPYABLE_ROW_DATA_SET}
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.LIST_ROW}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
            }}
            onPress={item.action}
        >
            {(hovered) => (
                <>
                    <View
                        style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        <View
                            style={styles.userSelectNone}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            <AccountAvatar
                                size={avatarSize}
                                accountID={item.accountID}
                                accountEmail={item.login}
                                fallbackDisplayName={item.name ?? item.email}
                            />
                        </View>
                        <View style={[shouldUseNarrowTableLayout && styles.gap1, styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.name}
                                style={[styles.optionDisplayName, styles.pre]}
                                numberOfLines={1}
                                isCopyable
                            />
                            <TextWithTooltip
                                shouldShowTooltip
                                text={memberSubtitle}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                numberOfLines={1}
                                isCopyable
                            />
                        </View>
                    </View>

                    {!shouldUseNarrowTableLayout && shouldShowCustomField1Column && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            {!!item.employeeUserID && (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={item.employeeUserID}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    isCopyable
                                />
                            )}
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowCustomField2Column && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            {!!item.employeePayrollID && (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={item.employeePayrollID}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    isCopyable
                                />
                            )}
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            <Text
                                numberOfLines={1}
                                selectable
                                dataSet={COPYABLE_TEXT_DATA_SET}
                            >
                                {roleLabel}
                            </Text>
                        </View>
                    )}

                    <View {...getCellAccessibilityProps(isTableSemanticsEnabled)}>
                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, !hovered && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}
