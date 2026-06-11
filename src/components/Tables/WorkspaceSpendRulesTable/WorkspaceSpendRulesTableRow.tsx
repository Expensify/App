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
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type SpendRuleTableItem = TableData & {
    ruleID: string;
    isDefault: boolean;
    isBlock: boolean;
    actionLabel: string;
    cardSummary: string;
    ruleSummary: string;
    searchTokens: string[];
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
};

type WorkspaceSpendRulesTableRowProps = {
    item: SpendRuleTableItem;
    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;
    hasCustomRules: boolean;
    isFirstCustomRule: boolean;
};

function WorkspaceSpendRulesTableRow({item, rowIndex, shouldUseNarrowTableLayout, hasCustomRules, isFirstCustomRule}: WorkspaceSpendRulesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Lock']);

    const isDeleting = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'WorkspaceSpendRulesTableItem',
        isDeleting,
    };

    const accessibilityLabel = `${item.actionLabel}. ${item.cardSummary}. ${item.ruleSummary}`;

    const showSectionHeader = (!!item.isDefault && hasCustomRules) || isFirstCustomRule;

    const lockIcon = item.isDefault ? (
        <Icon
            src={Expensicons.Lock}
            width={variables.iconSizeNormal}
            height={variables.iconSizeNormal}
            fill={theme.icon}
        />
    ) : undefined;

    return (
        <>
            {!!showSectionHeader && (
                <View style={[styles.mh5, styles.pv2, styles.ph3, rowIndex !== 0 && styles.mt3]}>
                    <TextWithTooltip
                        text={item.isDefault ? 'Default' : 'Custom rules'}
                        style={[styles.textMicroSupporting]}
                    />
                </View>
            )}
            <Table.Row
                interactive
                rowIndex={rowIndex}
                disabled={item.disabled}
                accessibilityLabel={accessibilityLabel}
                skeletonReasonAttributes={reasonAttributes}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_ITEM}
                offlineWithFeedback={{pendingAction: item.pendingAction, shouldHideOnDelete: false}}
                onPress={item.action}
                checkboxReplacementElement={lockIcon}
            >
                {({hovered}) => (
                    <>
                        {shouldUseNarrowTableLayout && (
                            <View style={[styles.flex1, styles.justifyContentCenter]}>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                    <Badge
                                        text={item.actionLabel}
                                        badgeStyles={[styles.ml0, styles.justifyContentCenter, StyleUtils.getMinimumWidth(40)]}
                                        error={item.isBlock}
                                        success={!item.isBlock}
                                        isCondensed
                                    />
                                    <TextWithTooltip
                                        text={item.cardSummary}
                                        numberOfLines={1}
                                        style={[styles.optionDisplayName, styles.pre, styles.flexShrink1]}
                                    />
                                </View>
                                <TextWithTooltip
                                    text={item.ruleSummary}
                                    numberOfLines={1}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mt1]}
                                />
                            </View>
                        )}

                        {!shouldUseNarrowTableLayout && (
                            <View style={[styles.justifyContentCenter]}>
                                <Badge
                                    text={item.actionLabel}
                                    badgeStyles={[styles.ml0, styles.justifyContentCenter, StyleUtils.getMinimumWidth(40)]}
                                    error={item.isBlock}
                                    success={!item.isBlock}
                                    isCondensed
                                />
                            </View>
                        )}

                        {!shouldUseNarrowTableLayout && (
                            <View style={[styles.flex1]}>
                                <TextWithTooltip
                                    numberOfLines={1}
                                    text={item.cardSummary}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                />
                            </View>
                        )}

                        {!shouldUseNarrowTableLayout && (
                            <View style={[styles.flex1]}>
                                <TextWithTooltip
                                    numberOfLines={1}
                                    text={item.ruleSummary}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                />
                            </View>
                        )}

                        <Icon
                            src={Expensicons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </>
                )}
            </Table.Row>
        </>
    );
}

export default WorkspaceSpendRulesTableRow;
export type {SpendRuleTableItem};
