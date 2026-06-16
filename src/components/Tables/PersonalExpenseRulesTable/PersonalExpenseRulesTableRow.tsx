import {View} from 'react-native';
import Icon from '@components/Icon';
import TableRow from '@components/Table/TableRow';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {PersonalExpenseRuleRowData} from '.';

type PersonalExpenseRulesTableRowProps = {
    item: PersonalExpenseRuleRowData;
    rowIndex: number;
};

export default function PersonalExpenseRulesTableRow({item, rowIndex}: PersonalExpenseRulesTableRowProps) {
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
            onClick={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                shouldHideOnDelete: false,
            }}
        >
            {({hovered}) => (
                <>
                    <View>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.merchant}
                            />
                        </View>
                    </View>
                    <View>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.changes}
                            />
                        </View>
                    </View>

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </TableRow>
    );
}
