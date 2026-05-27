import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Table from '@components/Table';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {WorkspaceMemberRowData} from '.';

type WorkspaceMembersTableRowProps = {
    /** The member item for the row */
    item: WorkspaceMemberRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Whether the custom field 1 column is visible on web screens or not */
    shouldShowCustomField1Column: boolean;

    /** Whether the custom field 2 column is visible on web screens or not */
    shouldShowCustomField2Column: boolean;
};

export default function WorkspaceMembersTableRow({item, rowIndex, shouldShowCustomField1Column, shouldShowCustomField2Column, shouldUseNarrowTableLayout}: WorkspaceMembersTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    return (
        <Table.Row
            rowIndex={rowIndex}
            interactive={!item.disabled}
            skeletonReasonAttributes={{context: 'WorkspaceMembersTableRow'}}
            onPress={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                dismissError: item.dismissError,
            }}
        >
            {(hovered) => (
                <>
                    <View></View>
                    <View></View>

                    {shouldShowCustomField1Column && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text numberOfLines={1}>{item.employeeUserID}</Text>
                        </View>
                    )}

                    {shouldShowCustomField2Column && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text numberOfLines={1}>{item.employeePayrollID}</Text>
                        </View>
                    )}

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, !hovered && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}
