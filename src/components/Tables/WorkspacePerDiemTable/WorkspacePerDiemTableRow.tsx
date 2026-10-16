import {InlineTextEditCell} from '@components/EditableCell';
import Icon from '@components/Icon';
import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {PerDiemTableRowData} from '.';

import WorkspacePerDiemAmountCell from './WorkspacePerDiemAmountCell';

type WorkspacePerDiemTableRowProps = {
    /** Data about the per diem subrate */
    item: PerDiemTableRowData;

    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;
};

function WorkspacePerDiemTableRow({item, rowIndex, shouldUseNarrowTableLayout}: WorkspacePerDiemTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

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
                        <View
                            style={[styles.flex1]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            <InlineTextEditCell
                                value={item.destination}
                                accessibilityLabel={translate('common.destination')}
                                canEdit={item.canEditDestination && !item.disabled}
                                onSave={item.onRenameDestination}
                                displayTextStyle={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View
                            style={[styles.flex1]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            <InlineTextEditCell
                                value={item.subRateName}
                                accessibilityLabel={translate('common.subrate')}
                                canEdit={item.canEditSubrate && !item.disabled}
                                onSave={item.onRenameSubrate}
                                displayTextStyle={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View
                            style={[styles.flex1, styles.alignItemsEnd, styles.editableCellColumn]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            <WorkspacePerDiemAmountCell
                                rate={item.rate}
                                currency={item.currency}
                                displayText={item.formattedAmount}
                                canEdit={item.canEditAmount && !item.disabled}
                                onSave={item.onChangeAmount}
                            />
                        </View>
                    )}

                    <View {...getCellAccessibilityProps(isTableSemanticsEnabled)}>
                        <Icon
                            src={icons.ArrowRight}
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

export default WorkspacePerDiemTableRow;
