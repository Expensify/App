import Badge from '@components/Badge';
import Icon from '@components/Icon';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {RequireFieldsTableItem} from '@libs/RequireFieldsRulesUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type WorkspaceRequireFieldsTableRowProps = {
    item: RequireFieldsTableItem;
    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;
};

function WorkspaceRequireFieldsTableRow({item, rowIndex, shouldUseNarrowTableLayout}: WorkspaceRequireFieldsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Task']);

    const accessibilityLabel = `${item.typeLabel}. ${item.conditionText}. ${item.ruleDescription}`;
    const badgeColors = theme.reportStatusBadge.approved;

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_ITEM}
            offlineWithFeedback={{pendingAction: item.pendingAction, shouldHideOnDelete: false}}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                <Badge
                                    text={item.typeLabel}
                                    icon={Expensicons.Task}
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
                                    icon={Expensicons.Task}
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
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}

export default WorkspaceRequireFieldsTableRow;
