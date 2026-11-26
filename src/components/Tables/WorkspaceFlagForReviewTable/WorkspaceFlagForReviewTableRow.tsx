import Badge from '@components/Badge';
import Icon from '@components/Icon';
import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRuleErrors} from '@libs/actions/Policy/Rules';
import type {FlagForReviewTableItem} from '@libs/FlagForReviewRulesUtils';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

const FLAG_BADGE_BACKGROUND_COLOR = colors.tangerine200;
const FLAG_BADGE_TEXT_COLOR = colors.tangerine700;

type WorkspaceFlagForReviewTableRowProps = {
    item: FlagForReviewTableItem;
    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;
};

function WorkspaceFlagForReviewTableRow({item, rowIndex, shouldUseNarrowTableLayout}: WorkspaceFlagForReviewTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Flag']);
    const [feedback] = useOnyx(`${ONYXKEYS.COLLECTION.RULE}${item.ruleID}`, {
        selector: (rule) => (rule ? {errors: rule.errors, pendingAction: rule.pendingAction} : undefined),
    });

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const accessibilityLabel = `${item.typeLabel}. ${item.conditionText}. ${item.ruleDescription}`;

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_RULE_ITEM}
            offlineWithFeedback={{
                pendingAction: item.pendingAction,
                shouldHideOnDelete: false,
                errors: feedback?.errors,
                onClose: () => clearRuleErrors(item.ruleID, feedback),
            }}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                <Badge
                                    text={item.typeLabel}
                                    icon={Expensicons.Flag}
                                    iconFill={FLAG_BADGE_TEXT_COLOR}
                                    badgeStyles={[
                                        styles.ml0,
                                        styles.justifyContentCenter,
                                        styles.borderNone,
                                        StyleUtils.getMinimumWidth(variables.componentSizeNormal),
                                        StyleUtils.getBackgroundColorStyle(FLAG_BADGE_BACKGROUND_COLOR),
                                    ]}
                                    textStyles={StyleUtils.getColorStyle(FLAG_BADGE_TEXT_COLOR)}
                                    isCondensed
                                />
                                <Text style={styles.flex1}>{item.conditionText}</Text>
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
                                    icon={Expensicons.Flag}
                                    iconFill={FLAG_BADGE_TEXT_COLOR}
                                    badgeStyles={[
                                        styles.ml0,
                                        styles.justifyContentCenter,
                                        styles.borderNone,
                                        StyleUtils.getMinimumWidth(variables.componentSizeNormal),
                                        StyleUtils.getBackgroundColorStyle(FLAG_BADGE_BACKGROUND_COLOR),
                                    ]}
                                    textStyles={StyleUtils.getColorStyle(FLAG_BADGE_TEXT_COLOR)}
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
                            additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}

export default WorkspaceFlagForReviewTableRow;
