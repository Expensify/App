import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import Table from '@components/Table';
import type {TableData} from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type ExpenseDefaultTableItem = TableData & {
    ruleID: string;
    isRename: boolean;
    typeLabel: string;
    conditionText: string;
    ruleDescription: string;
    searchTokens: string[];
    pendingAction?: PendingAction;
    errors?: Errors;
    onCloseError?: () => void;
    action: () => void;
};

type WorkspaceExpenseDefaultsTableRowProps = {
    item: ExpenseDefaultTableItem;
    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;
};

function WorkspaceExpenseDefaultsTableRow({item, rowIndex, shouldUseNarrowTableLayout}: WorkspaceExpenseDefaultsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Pencil']);
    const {processedData} = useTableContext<ExpenseDefaultTableItem>();

    const tableRowItem = processedData.at(rowIndex) ?? item;

    const accessibilityLabel = `${tableRowItem.typeLabel}. ${tableRowItem.conditionText}. ${tableRowItem.ruleDescription}`;
    const badgeColors = tableRowItem.isRename ? theme.reportStatusBadge.approved : theme.reportStatusBadge.draft;

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={tableRowItem.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_ITEM}
            offlineWithFeedback={{pendingAction: tableRowItem.pendingAction, shouldHideOnDelete: false, errors: tableRowItem.errors, onClose: tableRowItem.onCloseError}}
            onPress={tableRowItem.action}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                <Badge
                                    text={tableRowItem.typeLabel}
                                    icon={Expensicons.Pencil}
                                    iconFill={badgeColors.textColor}
                                    badgeStyles={[
                                        styles.ml0,
                                        styles.justifyContentCenter,
                                        styles.borderNone,
                                        StyleUtils.getMinimumWidth(variables.componentSizeNormal),
                                        StyleUtils.getBackgroundColorStyle(badgeColors.backgroundColor),
                                    ]}
                                    textStyles={StyleUtils.getColorStyle(badgeColors.textColor)}
                                    isCondensed
                                />
                                <TextWithTooltip
                                    text={tableRowItem.conditionText}
                                    numberOfLines={1}
                                    style={[styles.optionDisplayName, styles.pre, styles.flexShrink1]}
                                />
                            </View>
                            <TextWithTooltip
                                text={tableRowItem.ruleDescription}
                                numberOfLines={1}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mt1]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <>
                            <View style={[styles.justifyContentCenter]}>
                                <Badge
                                    text={tableRowItem.typeLabel}
                                    icon={Expensicons.Pencil}
                                    iconFill={badgeColors.textColor}
                                    badgeStyles={[
                                        styles.ml0,
                                        styles.justifyContentCenter,
                                        styles.borderNone,
                                        StyleUtils.getMinimumWidth(variables.componentSizeNormal),
                                        StyleUtils.getBackgroundColorStyle(badgeColors.backgroundColor),
                                    ]}
                                    textStyles={StyleUtils.getColorStyle(badgeColors.textColor)}
                                    isCondensed
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <TextWithTooltip
                                    numberOfLines={1}
                                    text={tableRowItem.conditionText}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <TextWithTooltip
                                    numberOfLines={1}
                                    text={tableRowItem.ruleDescription}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                />
                            </View>
                        </>
                    )}

                    <Icon
                        src={Expensicons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || tableRowItem.disabled) && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}

export default WorkspaceExpenseDefaultsTableRow;
export type {ExpenseDefaultTableItem};
