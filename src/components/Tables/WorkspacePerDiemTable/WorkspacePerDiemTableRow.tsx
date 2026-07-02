import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PerDiemTableRowData} from '.';

type WorkspacePerDiemTableRowProps = {
    /** Data about the per diem subrate */
    item: PerDiemTableRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

function WorkspacePerDiemTableRow({item, rowIndex, shouldUseNarrowTableLayout}: WorkspacePerDiemTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const accessibilityLabel = [item.destination, item.subRateName, item.formattedAmount].filter(Boolean).join(', ');

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.ROW}
            offlineWithFeedback={{
                pendingAction: item.pendingAction,
                shouldHideOnDelete: false,
            }}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.destination}
                                style={[styles.optionDisplayName, styles.pre]}
                            />
                            <TextWithTooltip
                                shouldShowTooltip
                                text={[item.subRateName, item.formattedAmount].filter(Boolean).join(` ${CONST.DOT_SEPARATOR} `)}
                                numberOfLines={1}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mt1]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.destination}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.subRateName}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.alignItemsEnd]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.formattedAmount}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    <Icon
                        src={icons.ArrowRight}
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

export default WorkspacePerDiemTableRow;
