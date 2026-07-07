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
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import {View} from 'react-native';

type ExpenseDefaultTableItem = TableData & {
    ruleID: string;
    isMerchantType: boolean;
    isRename: boolean;
    groupID?: string;
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
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Pencil', 'Lock']);
    const {processedData} = useTableContext<ExpenseDefaultTableItem>();
    const {translate} = useLocalize();

    const isDeleting = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const accessibilityLabel = `${item.typeLabel}. ${item.conditionText}. ${item.ruleDescription}`;
    const badgeColors = item.isRename ? theme.reportStatusBadge.approved : theme.reportStatusBadge.draft;

    const prevItem = rowIndex > 0 ? processedData.at(rowIndex - 1) : undefined;
    const hasMultipleSections = processedData.some((rule) => rule.isMerchantType) && processedData.some((rule) => !rule.isMerchantType);
    const showSectionHeader = hasMultipleSections && (rowIndex === 0 || !!prevItem?.isMerchantType !== !!item.isMerchantType);

    const lockIcon = item.isMerchantType ? (
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
                        text={item.isMerchantType ? translate('workspace.rules.spendRules.merchantTypes') : translate('workspace.rules.spendRules.merchants')}
                        style={[styles.textMicroBoldSupporting, styles.lh14]}
                    />
                </View>
            )}
            <Table.Row
                interactive
                rowIndex={rowIndex}
                disabled={isDeleting}
                accessibilityLabel={accessibilityLabel}
                sentryLabel={item.isMerchantType ? CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_TYPE_RULE_ITEM : CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_ITEM}
                offlineWithFeedback={{pendingAction: item.pendingAction, shouldHideOnDelete: false, errors: item.errors, onClose: item.onCloseError}}
                onPress={item.action}
                checkboxReplacementElement={lockIcon}
            >
                {({hovered}) => (
                    <>
                        {shouldUseNarrowTableLayout && (
                            <View style={[styles.flex1, styles.justifyContentCenter]}>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                    <Badge
                                        text={item.typeLabel}
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
                            <>
                                <View style={[styles.justifyContentCenter]}>
                                    <Badge
                                        text={item.typeLabel}
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
                                        text={item.conditionText}
                                        style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    />
                                </View>
                                <View style={[styles.flex1]}>
                                    <TextWithTooltip
                                        numberOfLines={1}
                                        text={item.ruleDescription}
                                        style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    />
                                </View>
                            </>
                        )}

                        <Icon
                            src={Expensicons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || isDeleting) && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </>
                )}
            </Table.Row>
        </>
    );
}

export default WorkspaceExpenseDefaultsTableRow;
export type {ExpenseDefaultTableItem};
