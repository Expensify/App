import Badge from '@components/Badge';
import Icon from '@components/Icon';
import Table from '@components/Table';
import type {TableData} from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
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
import type {TranslationPaths} from '@src/languages/types';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type ExpenseDefaultsSection = ValueOf<typeof CONST.POLICY.EXPENSE_DEFAULTS_SECTION>;

type ExpenseDefaultTableItem = TableData & {
    ruleID: string;
    section: ExpenseDefaultsSection;
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

const SECTION_HEADER_TRANSLATION_KEYS = {
    [CONST.POLICY.EXPENSE_DEFAULTS_SECTION.CATEGORIES]: 'workspace.rules.spendRules.categories',
    [CONST.POLICY.EXPENSE_DEFAULTS_SECTION.MERCHANTS]: 'workspace.rules.spendRules.merchants',
    [CONST.POLICY.EXPENSE_DEFAULTS_SECTION.MERCHANT_TYPES]: 'workspace.rules.spendRules.merchantTypes',
} as const satisfies Record<ExpenseDefaultsSection, TranslationPaths>;

const SECTION_SENTRY_LABELS = {
    [CONST.POLICY.EXPENSE_DEFAULTS_SECTION.CATEGORIES]: CONST.SENTRY_LABEL.WORKSPACE.RULES.CATEGORY_TAX_RULE_ITEM,
    [CONST.POLICY.EXPENSE_DEFAULTS_SECTION.MERCHANTS]: CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_ITEM,
    [CONST.POLICY.EXPENSE_DEFAULTS_SECTION.MERCHANT_TYPES]: CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_TYPE_RULE_ITEM,
} as const satisfies Record<ExpenseDefaultsSection, string>;

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

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const isDeleting = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const accessibilityLabel = `${item.typeLabel}. ${item.conditionText}. ${item.ruleDescription}`;
    const badgeColors = item.isRename ? theme.reportStatusBadge.approved : theme.reportStatusBadge.draft;

    const prevItem = rowIndex > 0 ? processedData.at(rowIndex - 1) : undefined;
    const isMerchantType = item.section === CONST.POLICY.EXPENSE_DEFAULTS_SECTION.MERCHANT_TYPES;
    // A single section stays a flat list. The headers only earn their place once there is more than one group to tell apart.
    const hasMultipleSections = new Set(processedData.map((rule) => rule.section)).size > 1;
    const showSectionHeader = hasMultipleSections && (rowIndex === 0 || prevItem?.section !== item.section);

    const lockIcon = isMerchantType ? (
        <Tooltip text={translate('workspace.rules.spendRules.defaultRulesCannotBeDeleted')}>
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
                        text={translate(SECTION_HEADER_TRANSLATION_KEYS[item.section])}
                        style={[styles.textMicroBoldSupporting, styles.lh14]}
                    />
                </View>
            )}
            <Table.Row
                interactive
                rowIndex={rowIndex}
                disabled={isDeleting}
                accessibilityLabel={accessibilityLabel}
                sentryLabel={SECTION_SENTRY_LABELS[item.section]}
                offlineWithFeedback={{
                    pendingAction: item.pendingAction,
                    shouldHideOnDelete: false,
                    errors: item.errors,
                    onClose: item.onCloseError,
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
                                        shouldShowTooltip
                                        text={item.conditionText}
                                        numberOfLines={1}
                                        style={[styles.optionDisplayName, styles.pre, styles.flexShrink1]}
                                    />
                                </View>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={item.ruleDescription}
                                    numberOfLines={1}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mt1]}
                                />
                            </View>
                        )}

                        {!shouldUseNarrowTableLayout && (
                            <>
                                <View
                                    style={[styles.justifyContentCenter]}
                                    {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                                >
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
                                <View
                                    style={[styles.flex1]}
                                    {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                                >
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        numberOfLines={1}
                                        text={item.conditionText}
                                        style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    />
                                </View>
                                <View
                                    style={[styles.flex1]}
                                    {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                                >
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        numberOfLines={1}
                                        text={item.ruleDescription}
                                        style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    />
                                </View>
                            </>
                        )}

                        <View {...getCellAccessibilityProps(isTableSemanticsEnabled)}>
                            <Icon
                                src={Expensicons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || isDeleting) && styles.opacitySemiTransparent]}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </View>
                    </>
                )}
            </Table.Row>
        </>
    );
}

export default WorkspaceExpenseDefaultsTableRow;
export type {ExpenseDefaultTableItem};
