import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import TableRow from '@components/Table/TableRow';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {PersonalExpenseRuleRowData} from '.';

type PersonalExpenseRulesTableRowProps = {
    item: PersonalExpenseRuleRowData;
    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;
};

export default function PersonalExpenseRulesTableRow({item, rowIndex, shouldUseNarrowTableLayout}: PersonalExpenseRulesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const accessibilityLabel = `${item.merchant}, ${item.changes}`;

    return (
        <TableRow
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            skeletonReasonAttributes={{context: 'personalExpenseRulesTableRow'}}
            onPress={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                shouldHideOnDelete: false,
            }}
        >
            {({hovered}) => (
                <>
                    {!shouldUseNarrowTableLayout && (
                        <>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={item.merchant}
                                />
                            </View>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={item.changes}
                                />
                            </View>
                        </>
                    )}

                    {shouldUseNarrowTableLayout && (
                        <View>
                            <View style={[styles.gap1]}>
                                <Text numberOfLines={1}>item.merchant</Text>
                                <Text
                                    numberOfLines={1}
                                    style={styles.textLabel}
                                >
                                    {item.changes}
                                </Text>
                            </View>
                        </View>
                    )}

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                    />
                </>
            )}
        </TableRow>
    );
}
