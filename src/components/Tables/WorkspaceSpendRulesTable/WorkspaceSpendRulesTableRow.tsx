import Badge from '@components/Badge';
import Icon from '@components/Icon';
import Table from '@components/Table';
import type {TableData} from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';
import TextWithTooltip from '@components/TextWithTooltip';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import React from 'react';
import {View} from 'react-native';

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
};

function WorkspaceSpendRulesTableRow({item, rowIndex, shouldUseNarrowTableLayout}: WorkspaceSpendRulesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Lock', 'CircleSlash', 'Checkmark']);
    const {processedData} = useTableContext<SpendRuleTableItem>();

    const isDeleting = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const accessibilityLabel = `${item.actionLabel}. ${item.cardSummary}. ${item.ruleSummary}`;

    const prevItem = rowIndex > 0 ? processedData.at(rowIndex - 1) : undefined;
    const hasMultipleTypes = processedData.length > 1 && processedData.some((r) => r.isDefault !== processedData.at(0)?.isDefault);
    const showSectionHeader = hasMultipleTypes && (rowIndex === 0 || !!prevItem?.isDefault !== !!item.isDefault);

    const lockIcon = item.isDefault ? (
        <Tooltip text={translate('common.locked')}>
            <View>
                <Icon
                    src={Expensicons.Lock}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                    fill={theme.icon}
                />
            </View>
        </Tooltip>
    ) : undefined;

    return (
        <>
            {!!showSectionHeader && (
                <View style={[styles.mh5, styles.pv2, styles.ph3, StyleUtils.getBackgroundColorStyle(theme.hoverComponentBG), rowIndex === 0 ? styles.borderBottom : styles.borderTop]}>
                    <TextWithTooltip
                        text={item.isDefault ? translate('workspace.rules.spendRules.defaultSection') : translate('workspace.rules.spendRules.customRulesSection')}
                        style={[styles.textMicroBoldSupporting, styles.lh14]}
                    />
                </View>
            )}
            <Table.Row
                interactive
                rowIndex={rowIndex}
                disabled={isDeleting}
                accessibilityLabel={accessibilityLabel}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_ITEM}
                offlineWithFeedback={{
                    pendingAction: item.pendingAction,
                    shouldHideOnDelete: false,
                }}
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
                                        icon={item.isBlock ? Expensicons.CircleSlash : Expensicons.Checkmark}
                                        badgeStyles={[styles.ml0, styles.justifyContentCenter, StyleUtils.getMinimumWidth(variables.componentSizeNormal)]}
                                        error={item.isBlock}
                                        success={!item.isBlock}
                                        isCondensed
                                    />
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        text={item.cardSummary}
                                        numberOfLines={1}
                                        style={[styles.optionDisplayName, styles.pre, styles.flexShrink1]}
                                    />
                                </View>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={item.ruleSummary}
                                    numberOfLines={1}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mt1]}
                                />
                            </View>
                        )}

                        {!shouldUseNarrowTableLayout && (
                            <>
                                <View style={[styles.justifyContentCenter]}>
                                    <Badge
                                        text={item.actionLabel}
                                        icon={item.isBlock ? Expensicons.CircleSlash : Expensicons.Checkmark}
                                        badgeStyles={[styles.ml0, styles.justifyContentCenter, StyleUtils.getMinimumWidth(variables.componentSizeNormal)]}
                                        error={item.isBlock}
                                        success={!item.isBlock}
                                        isCondensed
                                    />
                                </View>
                                <View style={[styles.flex1]}>
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        numberOfLines={1}
                                        text={item.cardSummary}
                                        style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    />
                                </View>
                                <View style={[styles.flex1]}>
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        numberOfLines={1}
                                        text={item.ruleSummary}
                                        style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    />
                                </View>
                            </>
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
