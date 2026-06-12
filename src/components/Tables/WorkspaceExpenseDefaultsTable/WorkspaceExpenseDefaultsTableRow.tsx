import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import Table from '@components/Table';
import type {TableData} from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
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
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const isDeleting = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'WorkspaceExpenseDefaultsTableItem',
        isDeleting,
    };

    const accessibilityLabel = `${item.typeLabel}. ${item.conditionText}. ${item.ruleDescription}`;

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={isDeleting}
            accessibilityLabel={accessibilityLabel}
            skeletonReasonAttributes={reasonAttributes}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_ITEM}
            offlineWithFeedback={{pendingAction: item.pendingAction, shouldHideOnDelete: false, errors: item.errors, onClose: item.onCloseError}}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                <Badge
                                    text={item.typeLabel}
                                    badgeStyles={[styles.ml0, styles.justifyContentCenter, StyleUtils.getMinimumWidth(40)]}
                                    success
                                    isCondensed
                                />
                                <TextWithTooltip
                                    text={item.conditionText}
                                    numberOfLines={1}
                                    style={[styles.optionDisplayName, styles.pre, styles.flexShrink1]}
                                />
                            </View>
                            <TextWithTooltip
                                text={item.ruleDescription}
                                numberOfLines={1}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mt1]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.justifyContentCenter]}>
                            <Badge
                                text={item.typeLabel}
                                badgeStyles={[styles.ml0, styles.justifyContentCenter, StyleUtils.getMinimumWidth(40)]}
                                success
                                isCondensed
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                numberOfLines={1}
                                text={item.conditionText}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                numberOfLines={1}
                                text={item.ruleDescription}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    <Icon
                        src={Expensicons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, !hovered && styles.opacitySemiTransparent]}
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
