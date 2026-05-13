import React from 'react';
import {View} from 'react-native';
import Table from '@components/Table';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {WorkspaceCategoryTableRowData} from '.';

type WorkspaceCategoriesTableRowProps = {
    item: WorkspaceCategoryTableRowData;

    rowIndex: number;

    shouldShowApproverColumn: boolean;
};

export default function WorkspaceCategoriesTableRow({rowIndex, shouldShowApproverColumn, item}: WorkspaceCategoriesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            skeletonReasonAttributes={{context: 'categoriesTableRow'}}
            offlineWithFeedback={{errors: item.errors, pendingAction: item.pendingAction, shouldHideOnDelete: false}}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow]}></View>

                    <View style={[styles.flex1, styles.flexRow]}>
                        <Text>{item.name}</Text>
                    </View>

                    <View style={[styles.flex1, styles.flexRow]}></View>

                    {shouldShowApproverColumn && <View style={[styles.flex1, styles.flexRow]}></View>}

                    <View style={[styles.flex1, styles.flexRow]}></View>
                </>
            )}
        </Table.Row>
    );
}
