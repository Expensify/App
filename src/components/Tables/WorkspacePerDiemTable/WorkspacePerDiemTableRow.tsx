import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Table from '@components/Table';
import type {TableData} from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type PerDiemTableRowData = TableData & {
    subRateID: string;
    rateID: string;
    destination: string;
    subRateName: string;
    rate: number;
    formattedAmount: string;
    disabled?: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
};

type WorkspacePerDiemTableRowProps = {
    item: PerDiemTableRowData;
    rowIndex: number;
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
            }}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <TextWithTooltip
                                text={item.destination}
                                style={[styles.optionDisplayName, styles.pre]}
                            />
                            <TextWithTooltip
                                text={[item.subRateName, item.formattedAmount].filter(Boolean).join(` ${CONST.DOT_SEPARATOR} `)}
                                numberOfLines={1}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mt1]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                numberOfLines={1}
                                text={item.destination}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                numberOfLines={1}
                                text={item.subRateName}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.alignItemsEnd]}>
                            <TextWithTooltip
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
export type {PerDiemTableRowData};
